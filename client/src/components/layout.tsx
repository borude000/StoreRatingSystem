import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "./sidebar";
import UserAvatar from "./user-avatar";
import { UserRole } from "@shared/schema";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  if (!user) return null;
  
  let pageTitle = "Store Ratings";
  
  switch (user.role) {
    case UserRole.ADMIN:
      pageTitle = "Admin Dashboard";
      break;
    case UserRole.USER:
      pageTitle = "Store Ratings";
      break;
    case UserRole.STORE_OWNER:
      pageTitle = "Store Management";
      break;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-primary text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">StoreRatings</h1>
        <button className="text-white" aria-label="Toggle menu">
          <span className="sr-only">Toggle menu</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* User Profile Bar */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-700">{pageTitle}</h1>
            <UserAvatar />
          </div>
          
          {/* Page Content */}
          {children}
        </main>
      </div>
      
      <footer className="bg-slate-800 text-slate-400 py-4 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Store Rating Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
