import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import Providers from "@/components/Providers";
import { Session } from "next-auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Royal Kim",
  description: "RoyalKim - 블로그 플랫폼",
  metadataBase: new URL('https://royalkim.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Royal Kim',
    description: 'RoyalKim - 블로그 플랫폼',
    url: 'https://royalkim.com',
    siteName: 'Royal Kim',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Royal Kim',
    description: 'RoyalKim - 블로그 플랫폼',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="ko">
      <head>
        <link
          rel="icon"
          href="/favicon.png"
          type="image/png"
          sizes="32x32"
        />
        <link
          rel="apple-touch-icon"
          href="/favicon.png"
          type="image/png"
          sizes="180x180"
        />
      </head>
      <body className={inter.className}>
        <Providers session={session as Session | null}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
