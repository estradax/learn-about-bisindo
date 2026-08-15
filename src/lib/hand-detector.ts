import type { HandLandmarker, HandLandmarkerResult } from "@mediapipe/tasks-vision";

const HAND_LANDMARKER_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const HAND_LANDMARKER_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

/**
 * Detects hand landmarks per frame. Used both to gate prediction on a hand
 * being visible and, by landmark-based predictors, as their model input.
 */
export class HandDetector {
  private landmarker: HandLandmarker | null = null;

  async load() {
    const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
    const vision = await FilesetResolver.forVisionTasks(HAND_LANDMARKER_WASM_URL);
    this.landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: HAND_LANDMARKER_MODEL_URL, delegate: "GPU" },
      runningMode: "VIDEO",
      numHands: 2,
    });
  }

  detect(video: HTMLVideoElement): HandLandmarkerResult | null {
    if (!this.landmarker) return null;
    return this.landmarker.detectForVideo(video, performance.now());
  }

  dispose() {
    this.landmarker?.close();
    this.landmarker = null;
  }
}
