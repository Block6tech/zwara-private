import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useAdminStore, adminActions, type Appointment, type ApprovalStatus, type Patient, type ReviewStatus } from "@/lib/admin-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Check, X, Pencil, Trash2, ArrowLeft, ShieldCheck, Eye, EyeOff, Star } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — Zwara Tabeya" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

const statusColor: Record<ApprovalStatus, string> = {
  Pending: "bg-warning/15 text-warning-foreground border-warning/30",
  Approved: "bg-success/15 text-success border-success/30",
  Rejected: "bg-destructive/10 text-destructive border-destructive/30",
};

function StatusBadge({ status }: { status: string }) {
  const c = statusColor[status as ApprovalStatus] ?? "bg-muted text-muted-foreground border-border";
  return <Badge variant="outline" className={c}>{status}</Badge>;
}

function AdminPage() {
  const s = useAdminStore();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to app
            </Link>
            <div className="hidden md:flex items-center gap-2 ml-4">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold">Admin Panel</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/doctor" className="text-sm text-primary hover:underline">Doctor view →</Link>
            <Button size="sm" variant="outline" onClick={() => { adminActions.reset(); toast.success("Data reset"); }}>Reset data</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          <Stat label="Doctors" value={s.doctors.length} />
          <Stat label="Pending doctors" value={s.doctors.filter((d) => d.approval === "Pending").length} highlight />
          <Stat label="Patients" value={s.patients.length} />
          <Stat label="Suspended" value={s.patients.filter((p) => p.status === "Suspended").length} highlight />
          <Stat label="Appointments" value={s.appointments.length} />
          <Stat label="Pending appts" value={s.appointments.filter((a) => a.status === "Pending").length} highlight />
        </div>

        <Tabs defaultValue="doctors">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="accounts">Doctor accounts</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="specialties">Specialties</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="qa">Q&amp;A</TabsTrigger>
          </TabsList>

          <TabsContent value="doctors"><DoctorsTab /></TabsContent>
          <TabsContent value="accounts"><AccountsTab /></TabsContent>
          <TabsContent value="patients"><PatientsTab /></TabsContent>
          <TabsContent value="appointments"><AppointmentsTab role="admin" /></TabsContent>
          <TabsContent value="specialties"><SpecialtiesTab /></TabsContent>
          <TabsContent value="events"><EventsTab /></TabsContent>
          <TabsContent value="videos"><VideosTab /></TabsContent>
          <TabsContent value="qa"><QATab /></TabsContent>
        </Tabs>
      </main>
      <Toaster position="top-center" />
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <Card className={highlight ? "border-warning/40" : ""}>
      <CardContent className="p-3">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function DoctorsTab() {
  const s = useAdminStore();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<string | null>(null);
  const list = s.doctors.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()) || d.specialization.toLowerCase().includes(q.toLowerCase()));
  const editing = s.doctors.find((d) => d.id === edit) ?? null;

  return (
    <Card className="mt-4">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle>Doctors</CardTitle>
        <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell>{d.specialization}</TableCell>
                <TableCell>{d.city}</TableCell>
                <TableCell>{d.fee} KWD</TableCell>
                <TableCell><StatusBadge status={d.approval} /></TableCell>
                <TableCell className="text-right space-x-1">
                  {d.approval !== "Approved" && (
                    <Button size="sm" variant="outline" onClick={() => { adminActions.setApproval("doctors", d.id, "Approved"); toast.success("Approved"); }}>
                      <Check className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {d.approval !== "Rejected" && (
                    <Button size="sm" variant="outline" onClick={() => { adminActions.setApproval("doctors", d.id, "Rejected"); toast("Rejected"); }}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setEdit(d.id)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => { if (confirm("Delete doctor?")) { adminActions.deleteItem("doctors", d.id); toast("Deleted"); } }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit doctor</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <Field label="Name" value={editing.name} onChange={(v) => adminActions.editDoctor(editing.id, { name: v })} />
              <Field label="Specialization" value={editing.specialization} onChange={(v) => adminActions.editDoctor(editing.id, { specialization: v })} />
              <Field label="City" value={editing.city} onChange={(v) => adminActions.editDoctor(editing.id, { city: v })} />
              <Field label="Fee" type="number" value={String(editing.fee)} onChange={(v) => adminActions.editDoctor(editing.id, { fee: Number(v) || 0 })} />
              <Field label="Bio" multiline value={editing.bio} onChange={(v) => adminActions.editDoctor(editing.id, { bio: v })} />
            </div>
          )}
          <DialogFooter><Button onClick={() => { setEdit(null); toast.success("Saved"); }}>Done</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Field({ label, value, onChange, type = "text", multiline = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; multiline?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {multiline
        ? <Textarea value={value} onChange={(e) => onChange(e.target.value)} />
        : <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}

export function AppointmentsTab({ role, doctorId }: { role: "admin" | "doctor"; doctorId?: string }) {
  const s = useAdminStore();
  const [filter, setFilter] = useState<"All" | Appointment["status"]>("All");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const list = useMemo(() => s.appointments.filter((a) => {
    if (doctorId && a.doctorId !== doctorId) return false;
    if (filter !== "All" && a.status !== filter) return false;
    return true;
  }), [s.appointments, filter, doctorId]);

  const docName = (id: string) => s.doctors.find((d) => d.id === id)?.name ?? id;

  return (
    <Card className="mt-4">
      <CardHeader className="flex-row items-center justify-between gap-3 flex-wrap">
        <CardTitle>Appointments</CardTitle>
        <div className="flex gap-1 flex-wrap">
          {(["All", "Pending", "Approved", "Rejected", "Cancelled", "Completed"] as const).map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>{f}</Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              {!doctorId && <TableHead>Doctor</TableHead>}
              <TableHead>Slot</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.patient}</TableCell>
                {!doctorId && <TableCell>{docName(a.doctorId)}</TableCell>}
                <TableCell>{a.slot}</TableCell>
                <TableCell><StatusBadge status={a.status} /></TableCell>
                <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">{a.note ?? "—"}</TableCell>
                <TableCell className="text-right space-x-1">
                  {a.status === "Pending" && (
                    <Button size="sm" variant="outline" onClick={() => { adminActions.setApptStatus(a.id, "Approved"); toast.success("Approved"); }}>
                      <Check className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {(a.status === "Pending" || a.status === "Approved") && (
                    <Button size="sm" variant="outline" onClick={() => { setRejectId(a.id); setNote(""); }}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  {a.status === "Approved" && (
                    <Button size="sm" variant="outline" onClick={() => { adminActions.setApptStatus(a.id, "Cancelled", "Cancelled by " + role); toast("Cancelled"); }}>
                      Cancel
                    </Button>
                  )}
                  {a.status === "Approved" && (
                    <Button size="sm" variant="outline" onClick={() => { adminActions.setApptStatus(a.id, "Completed"); toast.success("Completed"); }}>
                      Complete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {list.length === 0 && (
              <TableRow><TableCell colSpan={doctorId ? 5 : 6} className="text-center text-muted-foreground py-8">No appointments</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={!!rejectId} onOpenChange={(o) => !o && setRejectId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject appointment</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Note to customer</label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for rejection (sent to patient)" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
            <Button onClick={() => {
              if (rejectId) { adminActions.setApptStatus(rejectId, "Rejected", note || "No reason provided"); toast("Rejected with note sent to patient"); }
              setRejectId(null);
            }}>Send rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function SpecialtiesTab() {
  const s = useAdminStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Stethoscope");
  const submit = () => {
    if (!name.trim()) return toast.error("Name required");
    adminActions.addSpecialty({ name: name.trim(), icon: icon.trim() || "Stethoscope" });
    toast.success("Specialty added");
    setName(""); setIcon("Stethoscope"); setOpen(false);
  };
  return (
    <Card className="mt-4">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle>Specialties</CardTitle>
        <Button size="sm" onClick={() => setOpen(true)}>New specialty</Button>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {s.specialties.map((sp) => (
            <Card key={sp.id} className="p-3 flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <Input value={sp.name} onChange={(e) => adminActions.editSpecialty(sp.id, { name: e.target.value })} className="font-medium" />
                <div className="mt-1"><StatusBadge status={sp.approval} /></div>
              </div>
              <div className="flex flex-col gap-1">
                <Button size="sm" variant="outline" onClick={() => adminActions.setApproval("specialties", sp.id, "Approved")}><Check className="w-3.5 h-3.5" /></Button>
                <Button size="sm" variant="outline" onClick={() => adminActions.deleteItem("specialties", sp.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New specialty</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Field label="Name" value={name} onChange={setName} />
            <Field label="Icon (lucide name, e.g. HeartPulse)" value={icon} onChange={setIcon} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function EventsTab() {
  const s = useAdminStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", city: "", country: "", specialization: "", type: "Conference" as "Conference" | "Workshop" | "Webinar" | "Campaign", attendees: 0 });
  const submit = () => {
    if (!form.title.trim() || !form.date.trim()) return toast.error("Title and date required");
    adminActions.addEvent({ ...form, attendees: Number(form.attendees) || 0 });
    toast.success("Event added");
    setForm({ title: "", date: "", city: "", country: "", specialization: "", type: "Conference", attendees: 0 });
    setOpen(false);
  };
  return (
    <Card className="mt-4">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle>Events</CardTitle>
        <Button size="sm" onClick={() => setOpen(true)}>New event</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Date</TableHead><TableHead>City</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {s.events.map((e) => (
              <TableRow key={e.id}>
                <TableCell><Input value={e.title} onChange={(ev) => adminActions.editEvent(e.id, { title: ev.target.value })} /></TableCell>
                <TableCell>{e.date}</TableCell>
                <TableCell>{e.city}</TableCell>
                <TableCell><StatusBadge status={e.approval} /></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="sm" variant="outline" onClick={() => adminActions.setApproval("events", e.id, "Approved")}><Check className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => adminActions.setApproval("events", e.id, "Rejected")}><X className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => adminActions.deleteItem("events", e.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New event</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
            <Field label="Date (e.g. May 22, 2026)" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
              <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
            </div>
            <Field label="Specialization" value={form.specialization} onChange={(v) => setForm({ ...form, specialization: v })} />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                  <option>Conference</option><option>Workshop</option><option>Webinar</option><option>Campaign</option>
                </select>
              </div>
              <Field label="Attendees" type="number" value={String(form.attendees)} onChange={(v) => setForm({ ...form, attendees: Number(v) || 0 })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function QATab() {
  const s = useAdminStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ user: "Admin", question: "", questionAr: "", category: "General", categoryAr: "عام", answerText: "", answerUser: "" });
  const submit = () => {
    if (!form.question.trim()) return toast.error("Question required");
    adminActions.addQA({
      user: form.user || "Admin",
      question: form.question.trim(),
      questionAr: form.questionAr.trim() || form.question.trim(),
      category: form.category || "General",
      categoryAr: form.categoryAr || form.category || "عام",
      time: "just now",
      timeAr: "الآن",
      answer: form.answerText.trim()
        ? { user: form.answerUser || "Admin", userAr: form.answerUser || "Admin", text: form.answerText.trim(), textAr: form.answerText.trim() }
        : undefined,
    });
    toast.success("Q&A added");
    setForm({ user: "Admin", question: "", questionAr: "", category: "General", categoryAr: "عام", answerText: "", answerUser: "" });
    setOpen(false);
  };
  return (
    <Card className="mt-4">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle>Q&amp;A</CardTitle>
        <Button size="sm" onClick={() => setOpen(true)}>New Q&amp;A</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Question</TableHead><TableHead>Category</TableHead><TableHead>Answered</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {s.qa.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="max-w-[360px] truncate">{q.question}</TableCell>
                <TableCell>{q.category}</TableCell>
                <TableCell>{q.answer ? "Yes" : "—"}</TableCell>
                <TableCell><StatusBadge status={q.approval} /></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="sm" variant="outline" onClick={() => adminActions.setApproval("qa", q.id, "Approved")}><Check className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => adminActions.setApproval("qa", q.id, "Rejected")}><X className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => adminActions.deleteItem("qa", q.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Q&amp;A</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Field label="Asked by" value={form.user} onChange={(v) => setForm({ ...form, user: v })} />
            <Field label="Question (EN)" multiline value={form.question} onChange={(v) => setForm({ ...form, question: v })} />
            <Field label="Question (AR)" multiline value={form.questionAr} onChange={(v) => setForm({ ...form, questionAr: v })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category (EN)" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
              <Field label="Category (AR)" value={form.categoryAr} onChange={(v) => setForm({ ...form, categoryAr: v })} />
            </div>
            <Field label="Answer (optional)" multiline value={form.answerText} onChange={(v) => setForm({ ...form, answerText: v })} />
            <Field label="Answered by" value={form.answerUser} onChange={(v) => setForm({ ...form, answerUser: v })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function GenericTab({ kind }: { kind: "videos" | "qa" }) {
  const s = useAdminStore();
  const items = s[kind] as Array<{ id: string; approval: ApprovalStatus } & Record<string, unknown>>;
  return (
    <Card className="mt-4">
      <CardHeader><CardTitle className="capitalize">{kind}</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((it) => (
              <TableRow key={it.id}>
                <TableCell>{(it.title as string) ?? (it.question as string) ?? it.id}</TableCell>
                <TableCell><StatusBadge status={it.approval} /></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="sm" variant="outline" onClick={() => adminActions.setApproval(kind, it.id, "Approved")}><Check className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => adminActions.setApproval(kind, it.id, "Rejected")}><X className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => adminActions.deleteItem(kind, it.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function parseYouTubeId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "shorts" || parts[0] === "embed") return parts[1] ?? null;
    }
    return null;
  } catch { return null; }
}

function VideosTab() {
  const s = useAdminStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState("");
  const [category, setCategory] = useState<"Awareness" | "Documentaries" | "Campaigns">("Awareness");
  const [duration, setDuration] = useState("");
  const [url, setUrl] = useState("");

  const reset = () => { setTitle(""); setChannel(""); setCategory("Awareness"); setDuration(""); setUrl(""); };

  const submit = () => {
    const ytId = parseYouTubeId(url);
    if (!title.trim()) return toast.error("Title required");
    if (!ytId) return toast.error("Invalid YouTube URL");
    adminActions.addVideo({
      title: title.trim(),
      channel: channel.trim() || "Unknown",
      category,
      duration: duration.trim() || "—",
      thumbColor: "oklch(0.65 0.14 250)",
      youtubeUrl: url.trim(),
      youtubeId: ytId,
    });
    toast.success("Video added");
    reset();
    setOpen(false);
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle>Videos</CardTitle>
        <Button size="sm" onClick={() => setOpen(true)}>New video</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Thumb</TableHead><TableHead>Title</TableHead><TableHead>Channel</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {s.videos.map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  {v.youtubeId ? (
                    <a href={v.youtubeUrl} target="_blank" rel="noreferrer">
                      <img src={`https://img.youtube.com/vi/${v.youtubeId}/default.jpg`} alt="" className="w-20 h-12 object-cover rounded" />
                    </a>
                  ) : <div className="w-20 h-12 rounded" style={{ background: v.thumbColor }} />}
                </TableCell>
                <TableCell className="font-medium max-w-[280px] truncate">{v.title}</TableCell>
                <TableCell>{v.channel}</TableCell>
                <TableCell>{v.category}</TableCell>
                <TableCell><StatusBadge status={v.approval} /></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="sm" variant="outline" onClick={() => adminActions.setApproval("videos", v.id, "Approved")}><Check className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => adminActions.setApproval("videos", v.id, "Rejected")}><X className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => adminActions.deleteItem("videos", v.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>New video post</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Field label="YouTube URL" value={url} onChange={setUrl} />
            {parseYouTubeId(url) && (
              <img src={`https://img.youtube.com/vi/${parseYouTubeId(url)}/mqdefault.jpg`} alt="preview" className="rounded w-full max-w-xs" />
            )}
            <Field label="Title" value={title} onChange={setTitle} />
            <Field label="Channel" value={channel} onChange={setChannel} />
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="Awareness">Awareness</option>
                <option value="Documentaries">Documentaries</option>
                <option value="Campaigns">Campaigns</option>
              </select>
            </div>
            <Field label="Duration (e.g. 8:42)" value={duration} onChange={setDuration} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function AccountsTab() {
  const s = useAdminStore();
  const [doctorId, setDoctorId] = useState<string>("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [created, setCreated] = useState<{ username: string; password: string; name: string } | null>(null);

  const accountsByDoctor = new Map(s.accounts.map((a) => [a.doctorId, a]));
  const withoutAccounts = s.doctors.filter((d) => !accountsByDoctor.has(d.id));

  const genPassword = () => Math.random().toString(36).slice(-10);

  const submit = () => {
    if (!doctorId) return toast.error("Select a doctor");
    if (!username.trim()) return toast.error("Username required");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    try {
      adminActions.createDoctorAccount(doctorId, username, password);
      const doc = s.doctors.find((d) => d.id === doctorId);
      setCreated({ username: username.trim().toLowerCase(), password, name: doc?.name ?? "" });
      setDoctorId(""); setUsername(""); setPassword("");
      toast.success("Account created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader><CardTitle>Doctor accounts</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border p-4 space-y-3">
          <div className="font-semibold">Create login for a doctor</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="">Select doctor…</option>
              {withoutAccounts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <div className="flex gap-2">
              <Input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button type="button" variant="outline" onClick={() => setPassword(genPassword())}>Gen</Button>
            </div>
            <Button onClick={submit}>Create</Button>
          </div>
          <p className="text-xs text-muted-foreground">The doctor uses these credentials at <Link to="/doctor" className="text-primary underline">/doctor</Link> to sign in and manage their profile & appointments.</p>
        </div>

        {created && (
          <div className="rounded-lg border border-success/40 bg-success/10 p-4">
            <div className="font-semibold mb-1">Credentials for {created.name}</div>
            <div className="text-sm">Username: <code className="bg-background px-1.5 py-0.5 rounded">{created.username}</code></div>
            <div className="text-sm">Password: <code className="bg-background px-1.5 py-0.5 rounded">{created.password}</code></div>
            <p className="text-xs text-muted-foreground mt-2">Copy & share these now. The password is hidden after leaving this tab.</p>
          </div>
        )}

        <div>
          <div className="font-semibold mb-2">Existing accounts</div>
          <Table>
            <TableHeader><TableRow><TableHead>Doctor</TableHead><TableHead>Username</TableHead><TableHead>Must change</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {s.accounts.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No accounts yet.</TableCell></TableRow>
              )}
              {s.accounts.map((a) => {
                const doc = s.doctors.find((d) => d.id === a.doctorId);
                return (
                  <TableRow key={a.doctorId}>
                    <TableCell className="font-medium">{doc?.name ?? a.doctorId}</TableCell>
                    <TableCell><code>{a.username}</code></TableCell>
                    <TableCell>{a.mustChangePassword ? "Yes" : "No"}</TableCell>
                    <TableCell>{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="sm" variant="outline" onClick={() => {
                        const p = genPassword();
                        adminActions.changeDoctorPassword(a.doctorId, p);
                        setCreated({ username: a.username, password: p, name: doc?.name ?? "" });
                        toast.success("Password reset");
                      }}>Reset password</Button>
                      <Button size="sm" variant="outline" onClick={() => { adminActions.removeDoctorAccount(a.doctorId); toast.success("Account removed"); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function PatientsTab() {
  const s = useAdminStore();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Suspended">("All");
  const [suspendId, setSuspendId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [viewId, setViewId] = useState<string | null>(null);

  const list = useMemo(() => s.patients.filter((p) => {
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    const t = q.trim().toLowerCase();
    if (!t) return true;
    return p.name.toLowerCase().includes(t) || p.phone.toLowerCase().includes(t) || (p.email ?? "").toLowerCase().includes(t);
  }), [s.patients, q, statusFilter]);

  const viewing: Patient | undefined = s.patients.find((p) => p.id === viewId);
  const viewingAppts = viewing ? s.appointments.filter((a) => a.patient.toLowerCase() === viewing.name.toLowerCase()) : [];

  return (
    <Card className="mt-4">
      <CardHeader className="flex-row items-center justify-between gap-3 flex-wrap">
        <CardTitle>Patients</CardTitle>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1">
            {(["All", "Active", "Suspended"] as const).map((f) => (
              <Button key={f} size="sm" variant={statusFilter === f ? "default" : "outline"} onClick={() => setStatusFilter(f)}>{f}</Button>
            ))}
          </div>
          <Input placeholder="Search name, phone, email…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-sm">{p.phone}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.email ?? "—"}</TableCell>
                <TableCell className="text-sm">{p.city ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={p.status === "Active" ? "bg-success/15 text-success border-success/30" : "bg-destructive/10 text-destructive border-destructive/30"}>
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="sm" variant="outline" onClick={() => setViewId(p.id)}>View</Button>
                  {p.status === "Active" ? (
                    <Button size="sm" variant="outline" onClick={() => { setSuspendId(p.id); setReason(""); }}>Suspend</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => { adminActions.activatePatient(p.id); toast.success("Reactivated"); }}>Activate</Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => { if (confirm(`Delete ${p.name}? This cannot be undone.`)) { adminActions.deletePatient(p.id); toast("Patient deleted"); } }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {list.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No patients</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={!!suspendId} onOpenChange={(o) => !o && setSuspendId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Suspend patient</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason</label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this patient being suspended?" />
            <p className="text-xs text-muted-foreground">Suspended patients cannot book new appointments.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendId(null)}>Cancel</Button>
            <Button onClick={() => {
              if (!reason.trim()) return toast.error("Reason required");
              if (suspendId) { adminActions.suspendPatient(suspendId, reason.trim()); toast("Patient suspended"); }
              setSuspendId(null);
            }}>Suspend</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{viewing?.name}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><div className="text-xs text-muted-foreground">Phone</div><div>{viewing.phone}</div></div>
                <div><div className="text-xs text-muted-foreground">Email</div><div>{viewing.email ?? "—"}</div></div>
                <div><div className="text-xs text-muted-foreground">City</div><div>{viewing.city ?? "—"}</div></div>
                <div><div className="text-xs text-muted-foreground">Status</div><div>{viewing.status}</div></div>
              </div>
              {viewing.status === "Suspended" && viewing.suspensionReason && (
                <div className="rounded border border-destructive/30 bg-destructive/5 p-2">
                  <div className="text-xs font-medium text-destructive">Suspension reason</div>
                  <div className="text-sm">{viewing.suspensionReason}</div>
                </div>
              )}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Appointments ({viewingAppts.length})</div>
                <div className="max-h-48 overflow-auto space-y-1">
                  {viewingAppts.length === 0 && <div className="text-xs text-muted-foreground">No appointments yet.</div>}
                  {viewingAppts.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-xs rounded border p-2">
                      <span>{a.slot}</span>
                      <StatusBadge status={a.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewId(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
