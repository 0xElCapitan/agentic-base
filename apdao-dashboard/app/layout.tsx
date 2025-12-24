import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "apDAO Treasury Dashboard",
  description: "Treasury, validator, and reward vault dashboard for apDAO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background">
        {children}
      </body>
    </html>
  );
}
