import '../globals.css';

export const metadata = {
  title: 'Admin — Ma Jemima',
  robots: { index: false, follow: false },
};

export default function AdminRoot({ children }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh bg-night text-ink">
        <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" />
        {children}
      </body>
    </html>
  );
}
