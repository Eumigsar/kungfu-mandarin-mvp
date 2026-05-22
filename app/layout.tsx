export const metadata = {
  title: 'Kung Fu Mandarin — MVP',
  description: 'MVP real (HSK1 only) no universo Kung Fu / Dojo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style= margin: 0, fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif' >
        {children}
      </body>
    </html>
  );
}
