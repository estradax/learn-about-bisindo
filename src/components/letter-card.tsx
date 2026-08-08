import Link from "next/link";
import type { LetterEntry } from "@/lib/alphabet";

const colorClasses: Record<LetterEntry["color"], string> = {
  sky: "bg-sky/30 hover:bg-sky/50",
  sun: "bg-sun/30 hover:bg-sun/50",
  grass: "bg-grass/30 hover:bg-grass/50",
  berry: "bg-berry/30 hover:bg-berry/50",
  grape: "bg-grape/30 hover:bg-grape/50",
};

export default function LetterCard({ letter, color }: LetterEntry) {
  return (
    <Link
      href={`/belajar/${letter}`}
      className={`flex aspect-square flex-col items-center justify-center rounded-3xl border-4 border-white shadow-md transition hover:scale-105 ${colorClasses[color]}`}
    >
      <span className="font-heading text-5xl text-foreground">{letter}</span>
    </Link>
  );
}
