"use client";

import { useEffect, useRef, useState } from "react";
import { drawHandLandmarks } from "@/lib/draw-hand-landmarks";
import { HandDetector } from "@/lib/hand-detector";
import { createDefaultPredictor } from "@/lib/predictors";
import type { Prediction, SignPredictor } from "@/lib/predictors/types";

const PREDICT_INTERVAL_MS = 500;
const FREEZE_DELAY_MS = 1200;
const CONFIDENCE_THRESHOLD = 0.7;

type Status = "loading" | "camera" | "ready" | "error";

type CameraPredictorProps = {
  targetLetter?: string;
  onCorrect?: () => void;
  /** Swap in a different sign-classification model. Defaults to NEXT_PUBLIC_CLASSIFIER_MODEL (or the ONNX CNN). */
  predictorFactory?: () => SignPredictor;
};

export default function CameraPredictor({
  targetLetter,
  onCorrect,
  predictorFactory = createDefaultPredictor,
}: CameraPredictorProps = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const predictorRef = useRef<SignPredictor | null>(null);
  const handDetectorRef = useRef<HandDetector | null>(null);

  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [frozen, setFrozen] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const solvedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;

    async function setup() {
      try {
        const predictor = predictorFactory();
        const handDetector = new HandDetector();

        await Promise.all([predictor.load(), handDetector.load()]);
        if (cancelled) return;
        predictorRef.current = predictor;
        handDetectorRef.current = handDetector;

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
      predictorRef.current?.dispose();
      predictorRef.current = null;
      handDetectorRef.current?.dispose();
      handDetectorRef.current = null;
    };
  }, [predictorFactory]);

  const runPrediction = async (cancelledRef: { current: boolean }) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const predictor = predictorRef.current;
    const handDetector = handDetectorRef.current;
    if (!video || !canvas || !predictor || !handDetector) return;

    if (solvedRef.current) return;

    const handResult = handDetector.detect(video);

    if (showLandmarks && overlayCanvasRef.current) {
      drawHandLandmarks(overlayCanvasRef.current, handResult, video.videoWidth, video.videoHeight);
    }

    if (!handResult || handResult.landmarks.length === 0) {
      setPrediction(null);
      return;
    }

    const best = await predictor.predict({ video, canvas, handResult });
    if (cancelledRef.current || !best) return;

    setPrediction(best);
    if (
      targetLetter &&
      best.letter.toUpperCase() === targetLetter.toUpperCase() &&
      best.confidence > CONFIDENCE_THRESHOLD
    ) {
      solvedRef.current = true;
      video.pause();
      setFrozen(true);
      setTimeout(() => onCorrect?.(), FREEZE_DELAY_MS);
    }
  };

  useEffect(() => {
    if (status !== "ready" || capturedImage) return;

    const cancelledRef = { current: false };

    const intervalId = setInterval(() => {
      runPrediction(cancelledRef);
    }, PREDICT_INTERVAL_MS);

    return () => {
      cancelledRef.current = true;
      clearInterval(intervalId);
    };
  }, [status, targetLetter, onCorrect, showLandmarks, capturedImage]);

  const handleManualCapture = async () => {
    if (status !== "ready") return;

    const video = videoRef.current;
    const predictor = predictorRef.current;
    const handDetector = handDetectorRef.current;
    if (!video || !predictor || !handDetector) return;

    const snapshotCanvas = document.createElement("canvas");
    snapshotCanvas.width = video.videoWidth;
    snapshotCanvas.height = video.videoHeight;
    const ctx = snapshotCanvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(snapshotCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, snapshotCanvas.width, snapshotCanvas.height);
    setCapturedImage(snapshotCanvas.toDataURL("image/png"));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const handResult = handDetector.detect(video);
    if (!handResult || handResult.landmarks.length === 0) {
      setPrediction(null);
      return;
    }
    const best = await predictor.predict({ video, canvas, handResult });
    setPrediction(best ?? null);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setPrediction(null);
  };

  useEffect(() => {
    if (showLandmarks) return;
    const overlay = overlayCanvasRef.current;
    const ctx = overlay?.getContext("2d");
    ctx?.clearRect(0, 0, overlay?.width ?? 0, overlay?.height ?? 0);
  }, [showLandmarks]);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border-8 border-sun bg-black shadow-lg">
        <video
          ref={videoRef}
          className="h-full w-full -scale-x-100 object-cover"
          playsInline
          muted
          style={capturedImage ? { display: "none" } : undefined}
        />
        {capturedImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={capturedImage}
            alt="Gambar yang diambil"
            className="h-full w-full object-cover"
          />
        )}
        <canvas
          ref={overlayCanvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full -scale-x-100 object-cover"
          style={capturedImage ? { display: "none" } : undefined}
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
        {frozen && (
          <div className="absolute inset-0 flex items-center justify-center bg-grass/30">
            <div className="flex h-24 w-24 animate-ping-once items-center justify-center rounded-full bg-white/90 text-5xl shadow-lg">
              ✅
            </div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex w-full items-center justify-between gap-2">
        {capturedImage ? (
          <button
            type="button"
            onClick={handleRetake}
            className="rounded-full bg-grape px-4 py-2 text-sm font-semibold text-white shadow-inner"
          >
            🔄 Ambil Ulang
          </button>
        ) : (
          <button
            type="button"
            onClick={handleManualCapture}
            disabled={status !== "ready"}
            className="rounded-full bg-grape px-4 py-2 text-sm font-semibold text-white shadow-inner disabled:opacity-50"
          >
            📸 Ambil Gambar
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowLandmarks((v) => !v)}
          className="rounded-full bg-white/70 px-3 py-1 text-xs text-foreground/70 shadow-inner"
        >
          {showLandmarks ? "Sembunyikan landmark" : "Tampilkan landmark"}
        </button>
      </div>

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
