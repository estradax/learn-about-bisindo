"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import CameraPredictor from "@/components/camera-predictor";

export default function PracticeModal({ letter }: { letter: string }) {
  const [open, setOpen] = useState(false);
  const [solved, setSolved] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function updateSize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (!solved) return;
    const audio = new Audio("/sounds/yay.mp3");
    audio.volume = 0.3;
    audio.addEventListener(
      "loadedmetadata",
      () => {
        audio.currentTime = 1;
      },
      { once: true },
    );
    audio.play().catch(() => {});
  }, [solved]);

  function close() {
    setOpen(false);
    setSolved(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-berry px-6 py-2 font-heading text-white shadow-md hover:bg-berry/90"
      >
        📷 Coba
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          {solved && (
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              numberOfPieces={300}
              recycle={false}
              className="!fixed !inset-0 z-[60]"
            />
          )}
          <div className="relative flex w-full max-w-md flex-col items-center gap-4 rounded-3xl bg-white p-6 shadow-xl">
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 text-2xl text-foreground/50 hover:text-foreground"
              aria-label="Tutup"
            >
              ×
            </button>
            <h2 className="font-heading text-2xl text-grape">
              Peragakan Huruf {letter}
            </h2>

            {solved ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="text-6xl">🥳</div>
                <p className="font-heading text-3xl text-grass">Horeee, benar!</p>
                <p className="text-foreground/70">Kamu berhasil memperagakan huruf {letter} 🙌</p>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-full bg-grass/40 px-6 py-2 font-heading hover:bg-grass/60"
                >
                  Selesai
                </button>
              </div>
            ) : (
              <CameraPredictor targetLetter={letter} onCorrect={() => setSolved(true)} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
