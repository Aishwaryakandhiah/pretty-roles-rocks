import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Shield } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole {
  user_id: string;
  full_name: string | null;
  role: AppRole | null;
  role_id: string | null;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name");
    const { data: roles } = await supabase.from("user_roles").select("id, user_id, role");

    if (profiles) {
      const merged = profiles.map((p) => {
        const userRole = roles?.find((r) => r.user_id === p.user_id);
        return {
          user_id: p.user_id,
          full_name: p.full_name,
          role: userRole?.role ?? null,
          role_id: userRole?.id ?? null,
        };
      });
      setUsers(merged);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const assignRole = async (userId: string, newRole: AppRole, existingRoleId: string | null) => {
    try {
      if (existingRoleId) {
        await supabase.from("user_roles").update({ role: newRole }).eq("id", existingRoleId);
      } else {
        await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
      }
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch {
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Manage Users</h1>
            <p className="text-sm text-muted-foreground">Assign roles to control access</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs font-mono">User ID</TableHead>
              <TableHead className="text-xs">Current Role</TableHead>
              <TableHead className="text-xs">Assign Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No users found</TableCell></TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.user_id} className="border-border/50">
                  <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{u.user_id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    {u.role ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium capitalize text-primary">
                        <Shield className="h-3 w-3" />{u.role}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">No role</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={u.role ?? ""}
                      onValueChange={(v) => assignRole(u.user_id, v as AppRole, u.role_id)}
                    >
                      <SelectTrigger className="w-36 bg-muted/50 border-border/50">
                        <SelectValue placeholder="Assign..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="engineer">Engineer</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
