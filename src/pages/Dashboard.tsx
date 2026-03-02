import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Database, Search, Shield, Activity } from "lucide-react";

export default function Dashboard() {
  const { user, role } = useAuth();
  const [boltCount, setBoltCount] = useState(0);

  useEffect(() => {
    supabase.from("bolts").select("id", { count: "exact", head: true }).then(({ count }) => {
      setBoltCount(count ?? 0);
    });
  }, []);

  const stats = [
    { label: "Total Bolts", value: boltCount, icon: Database, color: "text-primary" },
    { label: "Your Role", value: role ?? "Unassigned", icon: Shield, color: "text-success" },
    { label: "System Status", value: "Online", icon: Activity, color: "text-primary" },
    { label: "Checker", value: "Ready", icon: Search, color: "text-primary" },
  ];

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">
          Welcome back, <span className="gradient-text">{user?.user_metadata?.full_name || user?.email}</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Bolt Duplicate Detection System Overview</p>
      </motion.div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="mt-2 text-2xl font-bold capitalize">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 glass-card p-6"
      >
        <h2 className="text-lg font-semibold">About BoltGuard</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          BoltGuard is a Product Lifecycle Management system that detects duplicate bolt parts
          in your CAD database. It compares new bolt specifications against existing records using
          dimensional analysis (length, diameter, weight, tolerance) and categorical matching
          (material, manufacturing process) to prevent redundant part creation.
        </p>
        <div className="mt-4 flex gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Machine Learning</span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">CAD Integration</span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">PLM</span>
        </div>
      </motion.div>
    </div>
  );
}
