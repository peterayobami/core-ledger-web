import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { Providers } from "@/providers";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/index.css";

function RouteLoadingBar() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const start = () => setLoading(true);
        const end = () => setLoading(false);
        router.events.on("routeChangeStart", start);
        router.events.on("routeChangeComplete", end);
        router.events.on("routeChangeError", end);
        return () => {
            router.events.off("routeChangeStart", start);
            router.events.off("routeChangeComplete", end);
            router.events.off("routeChangeError", end);
        };
    }, [router]);

    if (!loading) return null;
    return (
        <div className="fixed top-0 left-0 right-0 z-50 h-[3px] overflow-hidden" style={{ backgroundColor: "var(--cl-alpha)" }}>
            <div className="cl-progress-bar h-full w-full relative" />
        </div>
    );
}

export default function App({ Component, pageProps }: AppProps) {
    return (
        <Providers>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <RouteLoadingBar />
                <AppShell>
                    <Component {...pageProps} />
                </AppShell>
            </TooltipProvider>
        </Providers>
    );
}
