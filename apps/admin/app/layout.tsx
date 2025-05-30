import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cookies } from "next/headers";
import AdminNavbar from "../components/common/navbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Restaurant Admin Dashboard",
  description: "Admin dashboard for managing restaurant items",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check if user is on the login page
  const isLoginPage = typeof window !== 'undefined' 
    ? window.location.pathname === '/login'
    : false;

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 min-h-screen`}>
        <div className="flex flex-col min-h-screen">
          {!isLoginPage && <AdminNavbar />}
          <main className="flex-grow py-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
