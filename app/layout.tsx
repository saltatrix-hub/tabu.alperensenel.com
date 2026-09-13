import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://tabu.alperensenel.com'),
  title: 'TABU! — Arkadaşlarınla Canlı Oyna',
  description: 'Odanı kur, takımını seç ve arkadaşlarınla canlı Tabu oyna.',
  openGraph: {
    title: 'TABU! — Arkadaşlarınla Canlı Oyna',
    description: 'Yasaklı kelimelere yakalanma. Odanı kur ve takımını oyuna çağır.',
    images: [{ url:'/og.png', width:1200, height:630, alt:'TABU! Yasaklı kelimelere yakalanma.' }],
  },
  twitter: {
    card:'summary_large_image',
    title:'TABU! — Arkadaşlarınla Canlı Oyna',
    description:'Yasaklı kelimelere yakalanma. Odanı kur ve takımını oyuna çağır.',
    images:['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
