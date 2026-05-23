import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ProITBridge ReviewAI — Code reviews that never sleep",
  description:
    "Self-hosted AI code review bot for GitHub pull requests. Senior-engineer-quality feedback in 10 seconds, inline on the diff. Open source, free tier, built by ProITBridge.",
  icons: {
    icon: "/proitbridge-logo.png",
  },
  openGraph: {
    title: "ProITBridge ReviewAI — Code reviews that never sleep",
    description:
      "AI code reviewer that watches every PR 24/7. Inline comments, one-click fixes, $0 infrastructure.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
