import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";
import { cn } from "@/lib/utils";
import { 
  Store, 
  Users, 
  LayoutDashboard, 
  UserCircle, 
  ChartBar, 
  LogOut, 
  Star 
} from "lucide-react";

export default function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  if (!user) return null;
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  const navItemClass = (active: boolean) => {
    return cn(
      "flex items-center space-x-2 py-2 px-4 transition-colors",
      active ? "bg-sky-700" : "hover:bg-sky-700"
    );
  };
  
  return (
    <aside className="hidden lg:block w-64 bg-slate-800 text-white">
      <div className="p-4 flex items-center space-x-2">
        <Star className="text-accent text-2xl" />
        <h1 className="text-xl font-bold">StoreRatings</h1>
      </div>
      
      <div className="mt-6">
        {/* Admin Navigation */}
        {user.role === UserRole.ADMIN && (
          <div>
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Administration
            </p>
            <Link href="/admin/dashboard">
              <a className={navItemClass(isActive("/admin/dashboard") || isActive("/"))}>
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </a>
            </Link>
            <Link href="/admin/stores">
              <a className={navItemClass(isActive("/admin/stores"))}>
                <Store className="w-5 h-5" />
                <span>Manage Stores</span>
              </a>
            </Link>
            <Link href="/admin/users">
              <a className={navItemClass(isActive("/admin/users"))}>
                <Users className="w-5 h-5" />
                <span>Manage Users</span>
              </a>
            </Link>
          </div>
        )}
        
        {/* User Navigation */}
        {user.role === UserRole.USER && (
          <div>
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              User Menu
            </p>
            <Link href="/user/stores">
              <a className={navItemClass(isActive("/user/stores") || isActive("/"))}>
                <Store className="w-5 h-5" />
                <span>Browse Stores</span>
              </a>
            </Link>
            <Link href="/user/account">
              <a className={navItemClass(isActive("/user/account"))}>
                <UserCircle className="w-5 h-5" />
                <span>My Account</span>
              </a>
            </Link>
          </div>
        )}
        
        {/* Store Owner Navigation */}
        {user.role === UserRole.STORE_OWNER && (
          <div>
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Store Management
            </p>
            <Link href="/owner/dashboard">
              <a className={navItemClass(isActive("/owner/dashboard") || isActive("/"))}>
                <ChartBar className="w-5 h-5" />
                <span>Store Dashboard</span>
              </a>
            </Link>
            <Link href="/owner/account">
              <a className={navItemClass(isActive("/owner/account"))}>
                <UserCircle className="w-5 h-5" />
                <span>My Account</span>
              </a>
            </Link>
          </div>
        )}
        
        {/* Common Links */}
        <div className="mt-6 pt-6 border-t border-slate-600">
          <a 
            href="#" 
            className="flex items-center space-x-2 py-2 px-4 hover:bg-sky-700 text-slate-300"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
