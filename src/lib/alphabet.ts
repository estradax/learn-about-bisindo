export type LetterEntry = {
  letter: string;
  color: string;
  tip: string;
};

const colors = ["sky", "sun", "grass", "berry", "grape"] as const;

export const alphabet: LetterEntry[] = Array.from({ length: 26 }, (_, i) => {
  const letter = String.fromCharCode(65 + i);
  return {
    letter,
    color: colors[i % colors.length],
    tip: `Begini cara membentuk huruf ${letter} dalam BISINDO.`,
  };
});

export function getLetter(letter: string): LetterEntry | undefined {
  return alphabet.find((entry) => entry.letter === letter.toUpperCase());
}
