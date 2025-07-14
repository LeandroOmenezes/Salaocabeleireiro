import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ClientSalesPage from "@/pages/client-sales-page";
import ResetPasswordPage from "@/pages/reset-password-page";
import ProfilePage from "@/pages/profile-page";
import ServiceManagementPage from "@/pages/service-management-page";
import BannerManagementPage from "@/pages/banner-management-page";
import FooterManagementPage from "@/pages/footer-management-page";
import SiteConfigPage from "@/pages/site-config-page";

import PriceManagementPage from "@/pages/price-management-page";
import CategoryManagementPage from "@/pages/category-management-page";

import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute, AdminProtectedRoute } from "@/lib/protected-route";
import { useThemeColor } from "@/hooks/use-theme-color";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/reset-password/:token" component={ResetPasswordPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <AdminProtectedRoute path="/dashboard" component={DashboardPage} />
      <AdminProtectedRoute path="/clients-sales" component={ClientSalesPage} />
      <AdminProtectedRoute path="/admin/services" component={ServiceManagementPage} />
      <AdminProtectedRoute path="/admin/banner" component={BannerManagementPage} />
      <AdminProtectedRoute path="/admin/footer" component={FooterManagementPage} />
      <AdminProtectedRoute path="/admin/prices" component={PriceManagementPage} />
      <AdminProtectedRoute path="/admin/categories" component={CategoryManagementPage} />
      <AdminProtectedRoute path="/admin/site-config" component={SiteConfigPage} />


      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  useThemeColor(); // Aplicar cores personalizadas
  
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
