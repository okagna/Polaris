import "./globals.css";
import { LangProvider } from "./lib/LangContext";
import Header from "./Header";

export const metadata = {
  title: "Polaris",
  description: "Retrouve un film, une série, un jeu ou un livre à partir d'une description",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-white">
        <LangProvider>
          <Header />
          <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
        </LangProvider>
      </body>
    </html>
  );
}