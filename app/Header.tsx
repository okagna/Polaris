"use client";
import Link from "next/link";
import { useLang } from "./lib/LangContext";

export default function Header() {
  const { lang, setLang, t } = useLang();

  return (
    <header className="bg-[#032541] text-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-8">
        <span className="text-2xl font-bold">
          <span className="text-[#90cea1]">POL</span>ARIS
        </span>
        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-[#01b4e4]">{t.search}</Link>
          <Link href="/favoris" className="hover:text-[#01b4e4]">{t.favorites}</Link>
        </nav>

        <div className="ml-auto flex border border-white/60 rounded overflow-hidden text-xs font-bold">
          <button
            onClick={() => setLang("fr")}
            className={`px-3 py-1 ${lang === "fr" ? "bg-white text-[#032541]" : ""}`}
          >
            FR
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 ${lang === "en" ? "bg-white text-[#032541]" : ""}`}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
}