import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { dark } from "@clerk/themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Career Coach",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/logo.png" sizes="any" />
        </head>
        <body className={`${inter.className}`} suppressHydrationWarning>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />

            <footer className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 py-16 border-t">
              <div className="container mx-auto px-4">
                <div className="text-center space-y-6">
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-4xl">🧠</span>
                    <h3 className="text-2xl font-bold text-primary">Skillmap</h3>
                  </div>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Empowering career growth through AI-powered learning roadmaps, 
                    interview preparation, and personalized guidance.
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <span>Built for</span>
                    <span className="font-semibold text-primary">SIH 2025</span>
                    <span>🧠</span>
                  </div>
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      © 2025 Skillmap. All rights reserved. Powered by AI innovation.
                    </p>
                  </div>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
