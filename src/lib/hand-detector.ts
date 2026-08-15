import type { HandLandmarker } from "@mediapipe/tasks-vision";

const HAND_LANDMARKER_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const HAND_LANDMARKER_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

/** Gates prediction on a hand actually being visible, independent of which sign classifier is in use. */
export class HandDetector {
  private landmarker: HandLandmarker | null = null;

  async load() {
    const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
    const vision = await FilesetResolver.forVisionTasks(HAND_LANDMARKER_WASM_URL);
    this.landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: HAND_LANDMARKER_MODEL_URL, delegate: "GPU" },
      runningMode: "VIDEO",
      numHands: 1,
    });
  }

  hasHand(video: HTMLVideoElement): boolean {
    if (!this.landmarker) return false;
    const result = this.landmarker.detectForVideo(video, performance.now());
    return result.landmarks.length > 0;
  }

  dispose() {
    this.landmarker?.close();
    this.landmarker = null;
  }
}
