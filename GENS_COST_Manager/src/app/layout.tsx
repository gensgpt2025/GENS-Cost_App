import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";
import { AppProvider } from "@/context/AppContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GENS Cost Manager",
  description: "Futsal Team Accounting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body className={cn(inter.className, "antialiased min-h-screen pb-20 md:pb-0 md:pt-16")}>
        <AppProvider>
          <Navbar />
          <main className="container mx-auto p-4 md:p-8">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
