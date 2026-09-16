import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import Navbar from "@/components/navbar";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PEMBACA",
  description:
    "PEMBACA — Penerjemah Bisindo dengan Analisis Citra berbasis AI. Belajar abjad BISINDO A-Z dan coba terjemahkan isyaratmu lewat kamera.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${baloo.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-20">
        {children}
        <Navbar />
      </body>
    </html>
  );
}
