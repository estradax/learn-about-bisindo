import type { HandLandmarkerResult } from "@mediapipe/tasks-vision";
import type { InferenceSession, Tensor } from "onnxruntime-web/wasm";
import type { Prediction, PredictorInput, SignPredictor } from "./types";

const MODEL_URL = "/model/bisindo_mlp.onnx";
const CLASSES_URL = "/model/bisindo_classes.json";
const NUM_LANDMARKS = 21;
const WRIST = 0;
const MIDDLE_MCP = 9;

function softmax(logits: Float32Array) {
  const max = Math.max(...logits);
  const exps = logits.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum);
}

/**
 * Normalizes one hand's 21 landmarks the same way `extract_landmarks.py`
 * did for training: pixel-space, wrist-centered, scaled by wrist->middle-MCP
 * distance. Returns a flat (63,) array.
 */
function normalizeHand(
  landmarks: { x: number; y: number; z: number }[],
  width: number,
  height: number,
): Float32Array {
  const pts = landmarks.map((lm) => [lm.x * width, lm.y * height, lm.z * width] as const);
  const wrist = pts[WRIST];
  const centered = pts.map(([x, y, z]) => [x - wrist[0], y - wrist[1], z - wrist[2]] as const);
  const mcp = centered[MIDDLE_MCP];
  const scale = Math.max(Math.hypot(mcp[0], mcp[1], mcp[2]), 1e-6);

  const out = new Float32Array(NUM_LANDMARKS * 3);
  centered.forEach(([x, y, z], i) => {
    out[i * 3] = x / scale;
    out[i * 3 + 1] = y / scale;
    out[i * 3 + 2] = z / scale;
  });
  return out;
}

/** Builds the (126,) input vector: right hand first, then left, zero-padded if a hand is missing. */
function buildFeatureVector(
  handResult: HandLandmarkerResult,
  width: number,
  height: number,
): Float32Array | null {
  if (handResult.landmarks.length === 0) return null;

  const vec = new Float32Array(2 * NUM_LANDMARKS * 3);
  handResult.landmarks.forEach((landmarks, i) => {
    const label = handResult.handedness[i]?.[0]?.categoryName;
    const slot = label === "Left" ? 1 : 0;
    vec.set(normalizeHand(landmarks, width, height), slot * NUM_LANDMARKS * 3);
  });
  return vec;
}

/** BISINDO letter classifier trained on MediaPipe hand-landmark features (mlp.pt -> ONNX). */
export class MlpLandmarkPredictor implements SignPredictor {
  private session: InferenceSession | null = null;
  private classes: string[] = [];

  async load() {
    const ort = await import("onnxruntime-web/wasm");
    ort.env.wasm.wasmPaths = "/ort/";

    const [session, classes] = await Promise.all([
      ort.InferenceSession.create(MODEL_URL, { executionProviders: ["wasm"] }),
      fetch(CLASSES_URL).then((res) => res.json() as Promise<string[]>),
    ]);
    this.session = session;
    this.classes = classes;
  }

  async predict({ video, handResult }: PredictorInput): Promise<Prediction | null> {
    const session = this.session;
    if (!session || this.classes.length === 0 || !handResult) return null;

    const features = buildFeatureVector(handResult, video.videoWidth, video.videoHeight);
    if (!features) return null;

    const ort = await import("onnxruntime-web/wasm");
    const tensor: Tensor = new ort.Tensor("float32", features, [1, features.length]);
    const outputs = await session.run({ input: tensor });

    const logits = outputs.logits.data as Float32Array;
    const probs = softmax(logits);
    let bestIdx = 0;
    for (let i = 1; i < probs.length; i++) {
      if (probs[i] > probs[bestIdx]) bestIdx = i;
    }
    return { letter: this.classes[bestIdx], confidence: probs[bestIdx] };
  }

  dispose() {
    this.session = null;
    this.classes = [];
  }
}
