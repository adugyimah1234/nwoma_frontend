import type { Metadata } from "next";
import { Gabarito } from "next/font/google";
// import { SideNav } from "@/components/nav";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import "@/style/globals.css";
import { Providers } from "./providers";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingProvider } from "@/components/nav/side-nav/components/LoadingContext";
import { NavigationProgressProvider } from "@/components/providers/navigation-progress-provider";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

const gabarito = Gabarito({ subsets: ["latin"], variable: "--font-gabarito" });

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("bg-background font-sans", gabarito.variable)}>
        <Providers>
          {/* Global navigation progress bar — shows on every page transition */}
          <NavigationProgressProvider />
          <LoadingProvider
            showOverlay={true}
            minLoadingTime={1500}
          >
            <AuthProvider>
              <div className="flex min-h-[100dvh]">
                <div className="flex-grow w-full">{children}</div>
              </div>
            </AuthProvider>
          </LoadingProvider>
        </Providers>
      </body>
    </html>
  );
}
      //           <ToastContainer
      //   position="top-right"
      //   autoClose={3000}
      //   hideProgressBar={false}
      //   newestOnTop
      //   closeOnClick
      //   pauseOnFocusLoss
      //   draggable
      //   pauseOnHover
      // />
