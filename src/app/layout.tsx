import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import BackToHomeButton from "@/components/BackToHomeButton";
import AIAssistantIcon from "@/components/AIAssistantIcon";
import VisitorTracker from "@/components/VisitorTracker";
// import WhatsAppButton from "@/components/WhatsAppButton"; // Hidden for now

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cap Rate - Premium Real Estate Marketplace",
  description: "The World's #1 Commercial Real Estate Marketplace. Find office, retail, industrial, and flex spaces for lease or sale. Over 300K+ active listings.",
  keywords: "commercial real estate, office space, retail space, industrial property, coworking, property for lease, property for sale",
  authors: [{ name: "Cap Rate" }],
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: "Cap Rate - Premium Real Estate Marketplace",
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
      <body className="overflow-x-hidden max-w-full">
        <VisitorTracker />
        <LayoutWrapper>{children}</LayoutWrapper>
        <BackToHomeButton />
        <AIAssistantIcon />
        {/* WhatsApp button hidden for now */}
        {/* <WhatsAppButton /> */}
      </body>
    </html>
  );
}

