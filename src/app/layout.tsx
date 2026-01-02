import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Script from "next/script";
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
        {/* Alli AI Widget for SEO Automation - www.capratecompany.com */}
        <Script
          id="alli-ai-widget"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function (w,d,s,o,f,js,fjs) {w['AlliJSWidget']=o;w[o] = w[o] || function () { (w[o].q = w[o].q || []).push(arguments) };js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);}(window, document, 'script', 'alli', 'https://static.alliai.com/widget/v1.js'));
              alli('init', 'site_nSmLXmYVidwM46JC');
              alli('optimize', 'all');
            `,
          }}
        />
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

