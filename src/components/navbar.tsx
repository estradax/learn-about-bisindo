import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b-4 border-foreground/10 bg-background/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-heading text-2xl text-berry">
          🤟 BISINDO Yuk!
        </Link>
        <div className="flex gap-4 font-heading text-lg">
          <Link
            href="/belajar"
            className="rounded-full px-4 py-2 transition hover:bg-sky/20"
          >
            Belajar
          </Link>
          <Link
            href="/coba"
            className="rounded-full px-4 py-2 transition hover:bg-sun/20"
          >
            Coba Sendiri
          </Link>
        </div>
      </nav>
    </header>
  );
}
