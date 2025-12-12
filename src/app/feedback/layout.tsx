import type { Metadata } from "next";
import "../[locale]/globals.css";

export const metadata: Metadata = {
  title: "Tagasiside - imeliq",
  description: "Anna tagasisidet imeliq joogi kohta",
};

export default function FeedbackLayout({
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
