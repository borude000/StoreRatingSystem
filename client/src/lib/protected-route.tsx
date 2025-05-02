import { useAuth, useRedirectByRole } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { UserRole } from "@shared/schema";
import AppLayout from "@/components/layout";

export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles,
}: {
  path: string;
  component: () => React.JSX.Element;
  allowedRoles: (keyof typeof UserRole)[];
}) {
  const { user, isLoading } = useAuth();
  const homeRoute = user ? useRedirectByRole(user) : "/auth";

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !user ? (
        <Redirect to="/auth" />
      ) : !allowedRoles.includes(user.role as keyof typeof UserRole) ? (
        <Redirect to={homeRoute} />
      ) : (
        <AppLayout>
          <Component />
        </AppLayout>
      )}
    </Route>
  );
}
