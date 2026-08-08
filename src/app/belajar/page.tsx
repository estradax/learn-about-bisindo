import { alphabet } from "@/lib/alphabet";
import LetterCard from "@/components/letter-card";

export default function BelajarPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <h1 className="mb-2 text-center font-heading text-4xl text-berry">
        Abjad BISINDO A-Z
      </h1>
      <p className="mb-10 text-center text-foreground/70">
        Pilih huruf untuk belajar!
      </p>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
        {alphabet.map((entry) => (
          <LetterCard key={entry.letter} {...entry} />
        ))}
      </div>
    </main>
  );
}
