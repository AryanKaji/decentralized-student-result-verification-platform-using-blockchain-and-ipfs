import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Decentralized Student Result Verification Platform Using Blockchain and IPFS",
  description: "A secure blockchain-based platform for publishing and verifying student results. It combines MongoDB, IPFS, and Ethereum to create tamper-proof academic records, maintain immutable version history, and enable public verification with transparent audit trails.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
