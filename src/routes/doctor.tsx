import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { ArrowLeft, Stethoscope } from "lucide-react";
import { AppointmentsTab } from "./admin";

export const Route = createFileRoute("/doctor")({
  head: () => ({ meta: [{ title: "Doctor Panel — Zwara Tabeya" }, { name: "robots", content: "noindex" }] }),
  component: DoctorPanel,
});

function DoctorPanel() {
  const s = useAdminStore();
  const [doctorId, setDoctorId] = useState<string>(s.doctors[0]?.id ?? "");
  const doc = s.doctors.find((d) => d.id === doctorId);
  const mine = s.appointments.filter((a) => a.doctorId === doctorId);
  const counts = {
    pending: mine.filter((a) => a.status === "Pending").length,
    approved: mine.filter((a) => a.status === "Approved").length,
    completed: mine.filter((a) => a.status === "Completed").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <div className="hidden md:flex items-center gap-2 ml-4">
              <Stethoscope className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold">Doctor Panel</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Select doctor" /></SelectTrigger>
              <SelectContent>
                {s.doctors.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Link to="/admin" className="text-sm text-primary hover:underline ml-2">Admin →</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {doc && (
          <Card className="mb-4">
            <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-sm text-muted-foreground">Signed in as</div>
                <div className="text-lg font-bold">{doc.name}</div>
                <div className="text-sm text-muted-foreground">{doc.specialization} • {doc.city}</div>
              </div>
              <div className="flex gap-3">
                <Stat label="Pending" value={counts.pending} />
                <Stat label="Approved" value={counts.approved} />
                <Stat label="Completed" value={counts.completed} />
              </div>
            </CardContent>
          </Card>
        )}

        <AppointmentsTab role="doctor" doctorId={doctorId} />
      </main>
      <Toaster position="top-center" />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center px-3">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
