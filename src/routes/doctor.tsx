import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAdminStore, adminActions } from "@/lib/admin-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { ArrowLeft, Stethoscope, LogOut } from "lucide-react";
import { AppointmentsTab } from "./admin";

export const Route = createFileRoute("/doctor")({
  head: () => ({ meta: [{ title: "Doctor Panel — Zwara Tabeya" }, { name: "robots", content: "noindex" }] }),
  component: DoctorPanel,
});

function DoctorPanel() {
  const s = useAdminStore();
  const session = s.session;
  const doc = session ? s.doctors.find((d) => d.id === session.doctorId) : null;
  const account = session ? s.accounts.find((a) => a.doctorId === session.doctorId) : null;

  if (!session || !doc || !account) {
    return <LoginScreen />;
  }

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
          <div className="flex items-center gap-3">
            <div className="text-sm hidden sm:block">
              <div className="font-medium leading-tight">{doc.name}</div>
              <div className="text-xs text-muted-foreground">@{account.username}</div>
            </div>
            <Button size="sm" variant="outline" onClick={() => { adminActions.doctorLogout(); toast.success("Signed out"); }}>
              <LogOut className="w-4 h-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {account.mustChangePassword && (
          <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 mb-4 text-sm">
            You are using a temporary password. Please set a new one in the <b>Account</b> tab.
          </div>
        )}

        <Tabs defaultValue="appointments">
          <TabsList>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="profile">My profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          <TabsContent value="appointments">
            <AppointmentsTab role="doctor" doctorId={doc.id} />
          </TabsContent>
          <TabsContent value="profile">
            <ProfileEditor doctorId={doc.id} />
          </TabsContent>
          <TabsContent value="account">
            <AccountSettings doctorId={doc.id} />
          </TabsContent>
        </Tabs>
      </main>
      <Toaster position="top-center" />
    </div>
  );
}

function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = adminActions.doctorLogin(username, password);
    if (!res.ok) toast.error(res.error);
    else toast.success("Welcome");
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" />
            <CardTitle>Doctor sign in</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Sign in</Button>
            <p className="text-xs text-muted-foreground text-center">
              Don't have an account? Ask the admin to create one for you.
            </p>
            <div className="text-center text-xs">
              <Link to="/" className="text-muted-foreground hover:underline">← Back to app</Link>
              {" · "}
              <Link to="/admin" className="text-primary hover:underline">Admin</Link>
            </div>
          </form>
        </CardContent>
      </Card>
      <Toaster position="top-center" />
    </div>
  );
}

function ProfileEditor({ doctorId }: { doctorId: string }) {
  const s = useAdminStore();
  const doc = s.doctors.find((d) => d.id === doctorId);
  const [form, setForm] = useState(() => ({
    name: doc?.name ?? "",
    nameAr: doc?.nameAr ?? "",
    specialization: doc?.specialization ?? "",
    subspecialty: doc?.subspecialty ?? "",
    city: doc?.city ?? "",
    fee: doc?.fee ?? 0,
    bio: doc?.bio ?? "",
    bioAr: doc?.bioAr ?? "",
    experienceYears: doc?.experienceYears ?? 0,
    languages: (doc?.languages ?? []).join(", "),
    expertise: (doc?.expertise ?? []).join(", "),
  }));
  if (!doc) return null;

  const save = () => {
    adminActions.editDoctor(doctorId, {
      name: form.name.trim(),
      nameAr: form.nameAr.trim(),
      specialization: form.specialization.trim(),
      subspecialty: form.subspecialty.trim(),
      city: form.city.trim(),
      fee: Number(form.fee) || 0,
      bio: form.bio.trim(),
      bioAr: form.bioAr.trim(),
      experienceYears: Number(form.experienceYears) || 0,
      languages: form.languages.split(",").map((x) => x.trim()).filter(Boolean),
      expertise: form.expertise.split(",").map((x) => x.trim()).filter(Boolean),
    });
    toast.success("Profile updated");
  };

  const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">{label}</label>{children}</div>
  );

  return (
    <Card className="mt-4">
      <CardHeader><CardTitle>My profile</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <F label="Name (EN)"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></F>
          <F label="Name (AR)"><Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} dir="rtl" /></F>
          <F label="Specialization"><Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} /></F>
          <F label="Subspecialty"><Input value={form.subspecialty} onChange={(e) => setForm({ ...form, subspecialty: e.target.value })} /></F>
          <F label="City"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></F>
          <F label="Fee (KWD)"><Input type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })} /></F>
          <F label="Experience (years)"><Input type="number" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })} /></F>
          <F label="Languages (comma-separated)"><Input value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} /></F>
          <F label="Expertise (comma-separated)"><Input value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} /></F>
        </div>
        <F label="Bio (EN)"><Textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></F>
        <F label="Bio (AR)"><Textarea rows={3} value={form.bioAr} onChange={(e) => setForm({ ...form, bioAr: e.target.value })} dir="rtl" /></F>
        <div className="flex justify-end"><Button onClick={save}>Save changes</Button></div>
      </CardContent>
    </Card>
  );
}

function AccountSettings({ doctorId }: { doctorId: string }) {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const submit = () => {
    if (pw.length < 6) return toast.error("Password must be at least 6 characters");
    if (pw !== confirm) return toast.error("Passwords do not match");
    adminActions.changeDoctorPassword(doctorId, pw);
    setPw(""); setConfirm("");
    toast.success("Password updated");
  };
  return (
    <Card className="mt-4 max-w-md">
      <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">New password</label>
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Confirm</label>
          <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <div className="flex justify-end"><Button onClick={submit}>Update password</Button></div>
      </CardContent>
    </Card>
  );
}
