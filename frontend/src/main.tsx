import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";
import { router } from "@/pages/routes/router";
import { AuthProvider } from "@/hooks/AuthProvider";
import { ThemeProvider } from "@/components/provider/theme";
import ErrorBoundary from "@/components/ErrorBoundary";
import "@uploadthing/react/styles.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" storageKey="fswg-theme">
    <StrictMode>
      <HelmetProvider>
        <ErrorBoundary>
          <AuthProvider>
            <RouterProvider router={router} />
            <Toaster
              position="top-right"
              richColors
              closeButton
              expand={false}
              toastOptions={{
                duration: 4000,
                className: "font-sans",
              }}
            />
          </AuthProvider>
        </ErrorBoundary>
      </HelmetProvider>
    </StrictMode>
  </ThemeProvider>
);