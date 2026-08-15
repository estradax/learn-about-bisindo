import type { InferenceSession, Tensor } from "onnxruntime-web/wasm";
import type { Prediction, PredictorInput, SignPredictor } from "./types";

const MODEL_URL = "/model/bisindo_large.onnx";
const CLASSES_URL = "/model/bisindo_classes.json";
const IMAGE_SIZE = 224;
const IMAGENET_MEAN = [0.485, 0.456, 0.406];
const IMAGENET_STD = [0.229, 0.224, 0.225];

function softmax(logits: Float32Array) {
  const max = Math.max(...logits);
  const exps = logits.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum);
}

/** Loads the BISINDO ONNX CNN classifier and runs 224x224 ImageNet-normalized inference. */
export class OnnxBisindoPredictor implements SignPredictor {
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

  async predict({ video, canvas }: PredictorInput): Promise<Prediction | null> {
    const session = this.session;
    if (!session || this.classes.length === 0) return null;

    canvas.width = IMAGE_SIZE;
    canvas.height = IMAGE_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const side = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - side) / 2;
    const sy = (video.videoHeight - side) / 2;
    ctx.drawImage(video, sx, sy, side, side, 0, 0, IMAGE_SIZE, IMAGE_SIZE);

    const { data } = ctx.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE);
    const chw = new Float32Array(3 * IMAGE_SIZE * IMAGE_SIZE);
    const planeSize = IMAGE_SIZE * IMAGE_SIZE;
    for (let i = 0; i < planeSize; i++) {
      const r = data[i * 4] / 255;
      const g = data[i * 4 + 1] / 255;
      const b = data[i * 4 + 2] / 255;
      chw[i] = (r - IMAGENET_MEAN[0]) / IMAGENET_STD[0];
      chw[planeSize + i] = (g - IMAGENET_MEAN[1]) / IMAGENET_STD[1];
      chw[2 * planeSize + i] = (b - IMAGENET_MEAN[2]) / IMAGENET_STD[2];
    }

    const ort = await import("onnxruntime-web/wasm");
    const tensor: Tensor = new ort.Tensor("float32", chw, [1, 3, IMAGE_SIZE, IMAGE_SIZE]);
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
