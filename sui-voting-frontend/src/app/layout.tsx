import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from 'next';
import { ThemeProvider } from "@/layout/theme-provider";

import "./globals.css";
import '@mysten/dapp-kit/dist/index.css';

import SuiLayoutProvider from "@/layout/SuiLayoutProvider";

import Navbar from "@/components/layout/navbar"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SuiVS - Voting on the Sui Blockchain", //or Rankiee
  description: "A voting poll built on the sui blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <SuiLayoutProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
			<section className="">
				<Navbar />
				
				<main className="">
					{ children }
				</main>
				
				<footer className="border-t border-border mt-16">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
						<div className="text-center text-muted-foreground text-sm">
							<p>Built on Sui • Powered by community votes</p>
						</div>
					</div>
				</footer>
				
			</section>
			<Toaster/>
			</ThemeProvider>
          </SuiLayoutProvider>
      </body>
    </html>
  );
}