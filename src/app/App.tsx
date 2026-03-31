import { useState } from "react";
import { Toaster } from "sonner";
import { KeyRound, AppWindow } from "lucide-react";
import { TitleBar } from "@/components/TitleBar";
import { UpdateNotification } from "@/components/UpdateNotification";
import { LicenciasPage } from "@/features/licencias/LicenciasPage";
import { AplicacionesPage } from "@/features/aplicaciones/AplicacionesPage";
import { cn } from "@/lib/utils";

type Tab = "licencias" | "aplicaciones";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("licencias");

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <TitleBar />
      <UpdateNotification />

      {/* Tabs */}
      <div className="flex border-b border-border px-6">
        <button
          onClick={() => setActiveTab("licencias")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
            activeTab === "licencias"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <KeyRound className="h-4 w-4" />
          Licencias
        </button>
        <button
          onClick={() => setActiveTab("aplicaciones")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
            activeTab === "aplicaciones"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <AppWindow className="h-4 w-4" />
          Aplicaciones
        </button>
      </div>

      <main className="flex-1 overflow-hidden">
        {activeTab === "licencias" ? <LicenciasPage /> : <AplicacionesPage />}
      </main>

      <Toaster
        position="bottom-right"
        theme="dark"
        richColors
        closeButton
      />
    </div>
  );
}
