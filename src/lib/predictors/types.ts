import type { HandLandmarkerResult } from "@mediapipe/tasks-vision";

export type Prediction = {
  letter: string;
  confidence: number;
};

export type PredictorInput = {
  video: HTMLVideoElement;
  /** Scratch canvas for cropping/resizing, for predictors that need pixel input. */
  canvas: HTMLCanvasElement;
  /** Hand landmarks/handedness for the current frame, already computed for the hand-presence gate. */
  handResult: HandLandmarkerResult | null;
};

/**
 * A sign-classification model that turns the current camera frame into a
 * letter prediction. Implementations own their own model loading, input
 * preprocessing, and inference — swap in a new model by writing a new
 * SignPredictor rather than touching CameraPredictor.
 */
export interface SignPredictor {
  load(): Promise<void>;
  predict(input: PredictorInput): Promise<Prediction | null>;
  dispose(): void;
}
