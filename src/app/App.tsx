import { Toaster } from "sonner";
import { TitleBar } from "@/components/TitleBar";
import { LicenciasPage } from "@/features/licencias/LicenciasPage";

export default function App() {
  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <TitleBar />
      <main className="flex-1 overflow-hidden">
        <LicenciasPage />
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
