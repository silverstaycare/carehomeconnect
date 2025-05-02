
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OwnerDashboard from "./pages/OwnerDashboard";
import FamilyDashboard from "./pages/FamilyDashboard";
import PropertyDetails from "./pages/PropertyDetails";
import ListProperty from "./pages/ListProperty";
import SearchResults from "./pages/SearchResults";
import SubscriptionPage from "./pages/SubscriptionPage";
import PaymentPage from "./pages/PaymentPage";
import ProfilePage from "./pages/ProfilePage";

// Context providers
import { AuthProvider } from "./contexts/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="owner/dashboard" element={<OwnerDashboard />} />
              <Route path="owner/list-property" element={<ListProperty />} />
              <Route path="owner/subscription" element={<SubscriptionPage />} />
              <Route path="family/dashboard" element={<FamilyDashboard />} />
              <Route path="property/:id" element={<PropertyDetails />} />
              <Route path="search" element={<SearchResults />} />
              <Route path="payment/:propertyId" element={<PaymentPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
