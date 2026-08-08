import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { alphabet, getLetter } from "@/lib/alphabet";

export function generateStaticParams() {
  return alphabet.map((entry) => ({ letter: entry.letter }));
}

export default async function LetterPage(props: PageProps<"/belajar/[letter]">) {
  const { letter } = await props.params;
  const entry = getLetter(letter);

  if (!entry) {
    notFound();
  }

  const index = alphabet.findIndex((e) => e.letter === entry.letter);
  const prev = alphabet[index - 1];
  const next = alphabet[index + 1];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-6 px-6 py-12 text-center">
      <Link href="/belajar" className="self-start text-foreground/60 hover:text-berry">
        ← Kembali ke daftar huruf
      </Link>
      <div className="relative h-56 w-56 overflow-hidden rounded-full border-8 border-sun bg-white p-6 shadow-lg">
        <Image
          src={entry.image}
          alt={`Simbol BISINDO huruf ${entry.letter}`}
          fill
          sizes="224px"
          className="object-contain"
          priority
        />
      </div>
      <h1 className="font-heading text-3xl">Huruf {entry.letter}</h1>
      <p className="max-w-md text-lg text-foreground/80">{entry.tip}</p>
      <div className="mt-4 flex w-full justify-between">
        {prev ? (
          <Link
            href={`/belajar/${prev.letter}`}
            className="rounded-full bg-grass/30 px-5 py-2 font-heading hover:bg-grass/50"
          >
            ← {prev.letter}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/belajar/${next.letter}`}
            className="rounded-full bg-grass/30 px-5 py-2 font-heading hover:bg-grass/50"
          >
            {next.letter} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </main>
  );
}
