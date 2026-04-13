import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketProvider";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SHOP.CO | Find Clothes That Matches Your Style",
  description: "E-commerce platform with the latest trends in clothes and fashion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="layout-wrapper">
          <AuthProvider>
            <SocketProvider>
              <CartProvider>
                <Navbar />
                <main>{children}</main>
                <Toaster position="top-right" />
              </CartProvider>
            </SocketProvider>
          </AuthProvider>
        </div>
      </body>

    </html>
  );
}
