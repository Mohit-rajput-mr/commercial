import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Commercial RE - Premium Real Estate Marketplace",
  description: "The World's #1 Commercial Real Estate Marketplace. Find office, retail, industrial, and flex spaces for lease or sale. Over 300K+ active listings.",
  keywords: "commercial real estate, office space, retail space, industrial property, coworking, property for lease, property for sale",
  authors: [{ name: "Commercial RE" }],
  openGraph: {
    title: "Commercial RE - Premium Real Estate Marketplace",
    description: "The World's #1 Commercial Real Estate Marketplace",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="overflow-x-hidden max-w-full">{children}</body>
    </html>
  );
}

