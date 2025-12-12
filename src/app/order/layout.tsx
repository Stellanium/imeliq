import type { Metadata } from "next";
import "../[locale]/globals.css";

export const metadata: Metadata = {
  title: "Telli - imeliq",
  description: "Telli imeliq jooki",
};

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="et">
      <body className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        {children}
      </body>
    </html>
  );
}
