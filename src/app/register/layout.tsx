import type { Metadata } from "next";
import "../[locale]/globals.css";

export const metadata: Metadata = {
  title: "Registreeru - imeliq",
  description: "Registreeru imeliq katsetajaks",
};

export default function RegisterLayout({
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
