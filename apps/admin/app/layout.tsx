import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ToastProvider } from "../context/ToastContext";
import { getServerSession } from "next-auth";
import SessionProvider from "../component/SessionProvider";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Vietnamese Restaurant | Authentic Vietnamese Cuisine",
  description: "Explore our delicious menu of authentic Vietnamese dishes. Order online for pickup or delivery.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SessionProvider session={session}>
          <ToastProvider>
              {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
