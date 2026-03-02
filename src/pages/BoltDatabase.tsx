import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Database, Search } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Bolt = Tables<"bolts">;

export default function BoltDatabase() {
  const [bolts, setBolts] = useState<Bolt[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("bolts").select("*").order("part_id").then(({ data }) => {
      setBolts(data ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = bolts.filter((b) =>
    [b.part_id, b.bolt_type, b.material, b.manufacturing_process]
      .some((v) => v.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bolt Database</h1>
            <p className="mt-1 text-sm text-muted-foreground">{bolts.length} parts registered</p>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <span className="text-sm font-mono text-muted-foreground">Admin View</span>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Part ID, type, material..."
            className="bg-muted/50 border-border/50 pl-10"
          />
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-mono text-xs text-primary">Part ID</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Material</TableHead>
                  <TableHead className="text-xs text-right">Length</TableHead>
                  <TableHead className="text-xs text-right">Diameter</TableHead>
                  <TableHead className="text-xs text-right">Weight</TableHead>
                  <TableHead className="text-xs">Process</TableHead>
                  <TableHead className="text-xs text-right">Tolerance</TableHead>
                  <TableHead className="text-xs text-right">Cost (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No bolts found</TableCell></TableRow>
                ) : (
                  filtered.map((bolt, i) => (
                    <TableRow key={bolt.id} className="border-border/50 hover:bg-muted/30">
                      <TableCell className="font-mono text-sm text-primary">{bolt.part_id}</TableCell>
                      <TableCell className="text-sm">{bolt.bolt_type}</TableCell>
                      <TableCell className="text-sm">{bolt.material}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{Number(bolt.length_mm)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{Number(bolt.diameter_mm)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{Number(bolt.weight_g)}</TableCell>
                      <TableCell className="text-sm">{bolt.manufacturing_process}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{Number(bolt.tolerance_mm)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{bolt.cost_inr != null ? Number(bolt.cost_inr).toFixed(2) : "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
