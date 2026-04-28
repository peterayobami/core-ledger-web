import type { AppProps } from "next/app";
import { Providers } from "@/providers";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/index.css";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <Providers>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <AppShell>
                    <Component {...pageProps} />
                </AppShell>
            </TooltipProvider>
        </Providers>
    );
}
