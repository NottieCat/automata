import type { Metadata } from "next";
// @ts-ignore: CSS import type declarations are not available in this project
import "./globals.css";
import {Outfit} from 'next/font/google'
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ClerkProvider } from '@clerk/nextjs'
import Provider from "./provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "AI Agent Builder Platform",
  description: "Build powerful AI agents effortlessly with a simple drag-and-drop interface — no coding required.",
};

const outfit = Outfit({subsets: ['latin']});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
        className={outfit.className}
        >
          <ConvexClientProvider>
            <Provider>
              {children}
              <Toaster />
              </Provider></ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
