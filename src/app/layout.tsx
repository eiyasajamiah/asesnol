import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Asesnol",
  description: "Smart Automated Trading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
