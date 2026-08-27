/* Atelier refractado: base oscura, cristal grueso y una experiencia de moda sobria. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ClientProposal from "./pages/ClientProposal";
import ClientPortal from "./pages/ClientPortal";
import ProfessionalStudio from "./pages/ProfessionalStudio";
import WardrobeStudio from "./pages/WardrobeStudio";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/studio"} component={ProfessionalStudio} />
      <Route path={"/studio/proposal/:clientId"} component={ClientProposal} />
      <Route path={"/studio/personal"} component={WardrobeStudio} />
      <Route path={"/client"} component={ClientPortal} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
