import "./globals.css";

export const metadata = {
  title: "Polaris",
  description: "Retrouve un film, une série, un jeu ou un livre à partir d'une description",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen bg-gray-50">
        <aside className="w-56 bg-gray-900 text-white flex flex-col p-4 gap-2">
          <h2 className="text-xl font-bold mb-6">Polaris</h2>
          <a href="/" className="px-3 py-2 rounded hover:bg-gray-700">🔍 Recherche</a>
          <a href="/favoris" className="px-3 py-2 rounded hover:bg-gray-700">❤️ Favoris</a>
          <a href="/profil" className="px-3 py-2 rounded hover:bg-gray-700">👤 Profil</a>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </body>
    </html>
  );
}