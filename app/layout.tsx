import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Futzer",
  description: "Alugue quadras de futebol e tênis perto de você. Rápido, fácil e seguro.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Futzer",
    description: "Alugue quadras de futebol e tênis perto de você. Rápido, fácil e seguro.",
    url: "https://www.futzer.com.br",
    siteName: "Futzer",
    images: [
      {
        url: "https://www.futzer.com.br/logo.png",
        width: 512,
        height: 512,
        alt: "Futzer Logo",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Futzer",
    description: "Alugue quadras de futebol e tênis perto de você. Rápido, fácil e seguro.",
    images: ["https://www.futzer.com.br/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()",
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
