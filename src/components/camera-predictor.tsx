"use client";

import { useEffect, useRef, useState } from "react";
import type { InferenceSession, Tensor } from "onnxruntime-web/wasm";
import type { HandLandmarker } from "@mediapipe/tasks-vision";

const MODEL_URL = "/model/bisindo_large.onnx";
const CLASSES_URL = "/model/bisindo_classes.json";
const IMAGE_SIZE = 224;
const IMAGENET_MEAN = [0.485, 0.456, 0.406];
const IMAGENET_STD = [0.229, 0.224, 0.225];
const PREDICT_INTERVAL_MS = 500;
const HAND_LANDMARKER_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const HAND_LANDMARKER_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

type Status = "loading" | "camera" | "ready" | "error";

function softmax(logits: Float32Array) {
  const max = Math.max(...logits);
  const exps = logits.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum);
}

export default function CameraPredictor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<InferenceSession | null>(null);
  const classesRef = useRef<string[]>([]);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [prediction, setPrediction] = useState<{ letter: string; confidence: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;

    async function setup() {
      try {
        const ort = await import("onnxruntime-web/wasm");
        ort.env.wasm.wasmPaths = "/ort/";

        const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");

        const [session, classes, vision] = await Promise.all([
          ort.InferenceSession.create(MODEL_URL, { executionProviders: ["wasm"] }),
          fetch(CLASSES_URL).then((res) => res.json() as Promise<string[]>),
          FilesetResolver.forVisionTasks(HAND_LANDMARKER_WASM_URL),
        ]);
        if (cancelled) return;
        sessionRef.current = session;
        classesRef.current = classes;

        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: HAND_LANDMARKER_MODEL_URL, delegate: "GPU" },
          runningMode: "VIDEO",
          numHands: 1,
        });
        if (cancelled) return;

        setStatus("camera");
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 480 }, height: { ideal: 480 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setErrorMessage(
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "Izin kamera ditolak. Aktifkan akses kamera di browser untuk mencoba fitur ini."
            : "Gagal memuat model atau kamera. Coba muat ulang halaman.",
        );
        setStatus("error");
      }
    }

    setup();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      handLandmarkerRef.current?.close();
      handLandmarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (status !== "ready") return;

    let cancelled = false;

    const intervalId = setInterval(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const session = sessionRef.current;
      const classes = classesRef.current;
      const handLandmarker = handLandmarkerRef.current;
      if (!video || !canvas || !session || !handLandmarker || classes.length === 0) return;

      const handResult = handLandmarker.detectForVideo(video, performance.now());
      if (handResult.landmarks.length === 0) {
        setPrediction(null);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

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
      if (cancelled) return;

      const logits = outputs.logits.data as Float32Array;
      const probs = softmax(logits);
      let bestIdx = 0;
      for (let i = 1; i < probs.length; i++) {
        if (probs[i] > probs[bestIdx]) bestIdx = i;
      }
      setPrediction({ letter: classes[bestIdx], confidence: probs[bestIdx] });
    }, PREDICT_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [status]);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border-8 border-sun bg-black shadow-lg">
        <video
          ref={videoRef}
          className="h-full w-full -scale-x-100 object-cover"
          playsInline
          muted
        />
        {status !== "ready" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white">
            {status === "error" ? (
              <p className="max-w-xs px-4 text-center">{errorMessage}</p>
            ) : (
              <p>{status === "loading" ? "Memuat model..." : "Menyalakan kamera..."}</p>
            )}
          </div>
        )}
      </div>
      <canvas ref={canvasRef} width={IMAGE_SIZE} height={IMAGE_SIZE} className="hidden" />

      <div className="flex h-24 w-full items-center justify-center rounded-2xl bg-white/70 shadow-inner">
        {prediction ? (
          <div className="text-center">
            <p className="font-heading text-5xl text-grape">{prediction.letter}</p>
            <p className="text-sm text-foreground/60">
              {Math.round(prediction.confidence * 100)}% yakin
            </p>
          </div>
        ) : (
          <p className="text-foreground/50">Tunjukkan tanganmu di depan kamera...</p>
        )}
      </div>
    </div>
  );
}
