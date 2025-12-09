import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "imeliq - Looduslik Energiajook",
  description: "100% looduslik energiajook - tervislik energia ilma kemikaalideta",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="et">
      <body className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        {children}
      </body>
    </html>
  );
}
