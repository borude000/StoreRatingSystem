import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "@/lib/protected-route";

// Admin pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminStores from "@/pages/admin/stores";
import AdminUsers from "@/pages/admin/users";

// User pages
import UserStores from "@/pages/user/stores";
import UserAccount from "@/pages/user/account";

// Store owner pages
import OwnerDashboard from "@/pages/owner/dashboard";
import OwnerAccount from "@/pages/owner/account";

function Router() {
  return (
    <Switch>
      {/* Auth page */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Admin Routes */}
      <ProtectedRoute path="/" component={AdminDashboard} allowedRoles={["admin"]} />
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} allowedRoles={["admin"]} />
      <ProtectedRoute path="/admin/stores" component={AdminStores} allowedRoles={["admin"]} />
      <ProtectedRoute path="/admin/users" component={AdminUsers} allowedRoles={["admin"]} />
      
      {/* User Routes */}
      <ProtectedRoute path="/user/stores" component={UserStores} allowedRoles={["user"]} />
      <ProtectedRoute path="/user/account" component={UserAccount} allowedRoles={["user"]} />
      
      {/* Store Owner Routes */}
      <ProtectedRoute path="/owner/dashboard" component={OwnerDashboard} allowedRoles={["owner"]} />
      <ProtectedRoute path="/owner/account" component={OwnerAccount} allowedRoles={["owner"]} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="store-ratings-theme">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
