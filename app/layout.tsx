import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "京阪工技社 業務アプリひな形",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
