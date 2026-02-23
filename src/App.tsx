import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import Financas from "./pages/Financas";
import Rotina from "./pages/Rotina";
import Atlas from "./pages/Atlas";
import Metas from "./pages/Metas";
import MenuPage from "./pages/MenuPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="dark min-h-screen bg-background text-foreground">
          <Routes>
            <Route path="/" element={<Financas />} />
            <Route path="/rotina" element={<Rotina />} />
            <Route path="/atlas" element={<Atlas />} />
            <Route path="/metas" element={<Metas />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
