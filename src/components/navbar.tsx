"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home", emoji: "🏠" },
  { href: "/belajar", label: "Belajar", emoji: "📖" },
  { href: "/coba", label: "Coba", emoji: "🤟" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 border-t-4 border-foreground/10 bg-background/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 pt-1">
        <span className="font-heading text-sm text-berry">PEMBACA</span>
      </div>
      <div className="mx-auto flex max-w-5xl items-stretch justify-around">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 font-heading text-xs transition ${
                active ? "text-berry" : "text-foreground/60"
              }`}
            >
              <span className="text-2xl">{item.emoji}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
