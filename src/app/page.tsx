import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-20 text-center">
      <span className="text-7xl">🤟🐻🌈</span>
      <h1 className="max-w-2xl font-heading text-5xl text-berry sm:text-6xl">
        Ayo Belajar BISINDO!
      </h1>
      <p className="max-w-xl text-lg text-foreground/80">
        Kenali abjad A sampai Z dalam Bahasa Isyarat Indonesia (BISINDO)
        lewat gambar seru, lalu coba peragakan sendiri di depan kamera!
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/belajar"
          className="rounded-full bg-berry px-8 py-4 font-heading text-xl text-white shadow-lg transition hover:scale-105"
        >
          📖 Mulai Belajar
        </Link>
        <Link
          href="/coba"
          className="rounded-full bg-grape px-8 py-4 font-heading text-xl text-white shadow-lg transition hover:scale-105"
        >
          📷 Coba Sendiri
        </Link>
      </div>
    </main>
  );
}
