import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoPrune - Cloud Cost Optimization",
  description: "Detect and delete unused AWS EBS volumes to save money",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

