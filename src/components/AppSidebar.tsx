import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Wrench, LayoutDashboard, Search, Database, Users, LogOut } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Duplicate Checker", icon: Search, path: "/checker" },
  { label: "Bolt Database", icon: Database, path: "/bolts", role: "admin" as const },
  { label: "Manage Users", icon: Users, path: "/users", role: "admin" as const },
];

export default function AppSidebar() {
  const { role, signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const visibleItems = navItems.filter(
    (item) => !item.role || role === item.role || (role as string) === "admin"
  );

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Wrench className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-bold gradient-text">BoltGuard</h1>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">PLM System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        {visibleItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-primary/10 text-primary glow-amber"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-border p-3">
        <div className="mb-2 px-3">
          <p className="truncate text-sm font-medium text-foreground">{user?.email}</p>
          <p className="text-xs capitalize text-primary">{role ?? "No role"}</p>
        </div>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
