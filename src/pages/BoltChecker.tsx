import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface CheckResult {
  isDuplicate: boolean;
  matchedPartId?: string;
  message: string;
}

const materials = ["Steel", "Stainless Steel", "Alloy Steel"];
const processes = ["CNC Machining", "Cold Forging", "Thread Rolling"];

export default function BoltChecker() {
  const [form, setForm] = useState({
    length: "", diameter: "", material: "", weight: "", tolerance: "", process: "",
  });
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setResult(null);

    const newBolt = {
      length: parseFloat(form.length),
      diameter: parseFloat(form.diameter),
      material: form.material,
      weight: parseFloat(form.weight),
      tolerance: parseFloat(form.tolerance),
      process: form.process,
    };

    // Fetch all bolts and compare client-side (replicating the ML model logic)
    const { data: bolts } = await supabase.from("bolts").select("*");

    let duplicateFound = false;
    let matchedId = "";

    if (bolts) {
      for (const bolt of bolts) {
        const lengthDiff = Math.abs(newBolt.length - Number(bolt.length_mm));
        const diameterDiff = Math.abs(newBolt.diameter - Number(bolt.diameter_mm));
        const materialMatch = newBolt.material === bolt.material;
        const weightDiff = Math.abs(newBolt.weight - Number(bolt.weight_g));
        const toleranceDiff = Math.abs(newBolt.tolerance - Number(bolt.tolerance_mm));
        const processMatch = newBolt.process === bolt.manufacturing_process;

        // Duplicate criteria: same length, diameter, material (matching the training logic)
        if (lengthDiff === 0 && diameterDiff === 0 && materialMatch) {
          duplicateFound = true;
          matchedId = bolt.part_id;
          break;
        }

        // Near-duplicate: very close parameters
        if (lengthDiff <= 2 && diameterDiff <= 1 && materialMatch && weightDiff <= 3 && toleranceDiff <= 0.01 && processMatch) {
          duplicateFound = true;
          matchedId = bolt.part_id;
          break;
        }
      }
    }

    // Simulate processing delay for UX
    await new Promise((r) => setTimeout(r, 800));

    setResult({
      isDuplicate: duplicateFound,
      matchedPartId: matchedId || undefined,
      message: duplicateFound
        ? `Duplicate bolt found! Matches ${matchedId}.`
        : "No duplicate found. Safe to create new part.",
    });
    setChecking(false);
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setResult(null);
  };

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Bolt Duplicate Checker</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter bolt specifications to check for duplicates</p>
      </motion.div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <form onSubmit={handleCheck} className="glass-card p-6 space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Bolt Specifications</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Length (mm)</Label>
                <Input type="number" step="any" value={form.length} onChange={(e) => updateField("length", e.target.value)} required className="bg-muted/50 border-border/50 font-mono" placeholder="e.g. 60" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Diameter (mm)</Label>
                <Input type="number" step="any" value={form.diameter} onChange={(e) => updateField("diameter", e.target.value)} required className="bg-muted/50 border-border/50 font-mono" placeholder="e.g. 10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Material</Label>
              <Select value={form.material} onValueChange={(v) => updateField("material", v)} required>
                <SelectTrigger className="bg-muted/50 border-border/50"><SelectValue placeholder="Select material" /></SelectTrigger>
                <SelectContent>
                  {materials.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Weight (g)</Label>
                <Input type="number" step="any" value={form.weight} onChange={(e) => updateField("weight", e.target.value)} required className="bg-muted/50 border-border/50 font-mono" placeholder="e.g. 36.76" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Tolerance (mm)</Label>
                <Input type="number" step="any" value={form.tolerance} onChange={(e) => updateField("tolerance", e.target.value)} required className="bg-muted/50 border-border/50 font-mono" placeholder="e.g. 0.02" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Manufacturing Process</Label>
              <Select value={form.process} onValueChange={(v) => updateField("process", v)} required>
                <SelectTrigger className="bg-muted/50 border-border/50"><SelectValue placeholder="Select process" /></SelectTrigger>
                <SelectContent>
                  {processes.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={checking} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              {checking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              {checking ? "Analyzing..." : "Check for Duplicates"}
            </Button>
          </form>
        </motion.div>

        {/* Result */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex items-start">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key={result.isDuplicate ? "dup" : "safe"}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full glass-card p-8 ${result.isDuplicate ? "glow-danger border-destructive/30" : "glow-success border-success/30"}`}
              >
                <div className="flex flex-col items-center text-center">
                  {result.isDuplicate ? (
                    <XCircle className="h-16 w-16 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-16 w-16 text-success" />
                  )}
                  <h3 className={`mt-4 text-xl font-bold ${result.isDuplicate ? "text-destructive" : "text-success"}`}>
                    {result.isDuplicate ? "Duplicate Found!" : "No Duplicate"}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{result.message}</p>
                  {result.matchedPartId && (
                    <div className="mt-4 rounded-lg bg-muted px-4 py-2 font-mono text-sm">
                      Match: <span className="text-primary">{result.matchedPartId}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-16 text-center"
              >
                <Search className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-sm text-muted-foreground">Enter bolt specifications and click check to analyze</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
