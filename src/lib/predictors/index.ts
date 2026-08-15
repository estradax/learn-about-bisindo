import { MlpLandmarkPredictor } from "./mlp-landmark-predictor";
import { OnnxBisindoPredictor } from "./onnx-bisindo-predictor";
import type { SignPredictor } from "./types";

export type ClassifierModel = "onnx-cnn" | "mlp-landmark";

const FACTORIES: Record<ClassifierModel, () => SignPredictor> = {
  "onnx-cnn": () => new OnnxBisindoPredictor(),
  "mlp-landmark": () => new MlpLandmarkPredictor(),
};

const DEFAULT_MODEL: ClassifierModel = "onnx-cnn";

function resolveModel(): ClassifierModel {
  const value = process.env.NEXT_PUBLIC_CLASSIFIER_MODEL;
  return value && value in FACTORIES ? (value as ClassifierModel) : DEFAULT_MODEL;
}

/** Builds the sign predictor selected via NEXT_PUBLIC_CLASSIFIER_MODEL (defaults to "onnx-cnn"). */
export function createDefaultPredictor(): SignPredictor {
  return FACTORIES[resolveModel()]();
}

export type { Prediction, PredictorInput, SignPredictor } from "./types";
