export type Prediction = {
  letter: string;
  confidence: number;
};

/**
 * A sign-classification model that turns a square-cropped video frame into a
 * letter prediction. Implementations own their own model loading, input
 * preprocessing, and inference — swap in a new model by writing a new
 * SignPredictor rather than touching CameraPredictor.
 */
export interface SignPredictor {
  load(): Promise<void>;
  /** Runs inference on the current video frame. `canvas` is scratch space for cropping/resizing. */
  predict(video: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<Prediction | null>;
  dispose(): void;
}
