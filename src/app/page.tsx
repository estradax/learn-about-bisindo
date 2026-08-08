const sections = [
  {
    emoji: "🤔",
    title: "Apa itu BISINDO?",
    body: "BISINDO (Bahasa Isyarat Indonesia) adalah bahasa isyarat yang lahir dan berkembang secara alami di tengah komunitas Tuli di Indonesia. Bahasa ini punya gerakan tangan, ekspresi wajah, dan gerak tubuh sendiri, beda-beda di tiap daerah!",
  },
  {
    emoji: "📜",
    title: "Sejarah Singkat",
    body: "BISINDO tumbuh dari interaksi sehari-hari antar teman Tuli sejak lama, jauh sebelum ada bahasa isyarat baku yang diajarkan di sekolah. Karena itu, BISINDO disebut bahasa isyarat alami buatan komunitas Tuli sendiri.",
  },
  {
    emoji: "🌏",
    title: "Beda dengan SIBI",
    body: "SIBI (Sistem Isyarat Bahasa Indonesia) dibuat oleh pemerintah mengikuti struktur Bahasa Indonesia lisan. BISINDO justru tumbuh alami dari komunitas Tuli dan lebih banyak dipakai sehari-hari.",
  },
  {
    emoji: "🙌",
    title: "Kenapa Perlu Belajar?",
    body: "Belajar BISINDO membantu kita ngobrol dan berteman dengan teman-teman Tuli, membuat lingkungan sekitar jadi lebih ramah dan inklusif untuk semua orang.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-8 px-6 py-10 text-center">
      <span className="text-4xl">🤟🐻🌈</span>
      <div className="flex flex-col gap-1">
        <h1 className="max-w-2xl font-heading text-3xl text-berry sm:text-4xl">
          Ayo Belajar BISINDO!
        </h1>
        <p className="max-w-xl text-lg text-foreground/80">
          Belajar abjad BISINDO A-Z lewat gambar seru!
        </p>
      </div>

      <div className="flex w-full max-w-xl flex-col gap-4 text-left">
        {sections.map((section) => (
          <div
            key={section.title}
            className="flex gap-4 rounded-3xl border-4 border-foreground/10 bg-white/60 p-5 shadow-sm"
          >
            <span className="text-4xl">{section.emoji}</span>
            <div>
              <h2 className="font-heading text-xl text-grape">
                {section.title}
              </h2>
              <p className="mt-1 text-foreground/80">{section.body}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
