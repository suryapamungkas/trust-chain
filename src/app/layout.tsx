import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
  title: "TrustChain",
  description:
    "Platform digital berbasis AI dan Blockchain untuk mencatat seluruh perjalanan produk UMKM Indonesia. Transparansi, kepatuhan, dan kesiapan ekspor dalam satu ekosistem terintegrasi.",
  icons: {
    icon: "/logo_putih.png",
    shortcut: "/logo_putih.png",
    apple: "/logo_putih.png",
  },
  keywords: [
    "UMKM Indonesia",
    "blockchain supply chain",
    "AI analitik",
    "ekspor UMKM",
    "digital identity produk",
    "smart contract",
    "TrustChain",
  ],
  authors: [{ name: "TrustChain UMKM Team" }],
  openGraph: {
    title: "TrustChain",
    description: "Platform Blockchain AI untuk Rantai Pasokan UMKM Indonesia",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('tc_theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <div className="orb-1" />
        <div className="orb-2" />
        <div className="orb-3" />
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              {children}
              <ChatWidget />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "var(--bg-card)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "12px",
                    fontSize: "14px",
                    backdropFilter: "blur(20px)",
                  },
                  success: {
                    iconTheme: { primary: "#ffffff", secondary: "#000000" },
                  },
                  error: {
                    iconTheme: { primary: "#888888", secondary: "#000000" },
                  },
                }}
              />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

