import CameraPredictor from "@/components/camera-predictor";

export default function CobaPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-6 px-6 py-12 text-center">
      <span className="text-6xl">📷✨</span>
      <h1 className="font-heading text-3xl text-grape">Yuk, Coba Peragakan!</h1>
      <p className="max-w-md text-foreground/70">
        Tunjukkan huruf BISINDO ke kamera, nanti kami tebak huruf apa itu!
      </p>
      <CameraPredictor />
    </main>
  );
}
