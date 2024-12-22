import "./globals.css";
import './page.module.css';
import "@repo/ui/styles.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { AppbarClient } from "./AppbarClient";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "PayTM",
  description: "Make faster payments",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <Providers>
        <body className={inter.className}>
          <div className="min-w-screen min-h-screen bg-[#ebe6e6]">
            <AppbarClient />
            {children}
          </div>
        </body>
      </Providers>
    </html>
  );
}
