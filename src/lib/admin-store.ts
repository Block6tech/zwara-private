import { useEffect, useState } from "react";
import { doctors as seedDoctors, specialties as seedSpecs, events as seedEvents, videos as seedVideos, qaItems as seedQA, type Doctor, type Specialty, type EventItem, type VideoItem, type QAItem } from "./mock-data";

export type ApptStatus = "Pending" | "Approved" | "Rejected" | "Cancelled" | "Completed";
export type Appointment = {
  id: string;
  doctorId: string;
  patient: string;
  slot: string;
  status: ApptStatus;
  note?: string;
  createdAt: string;
};

export type ApprovalStatus = "Pending" | "Approved" | "Rejected";

export type DoctorAccount = {
  doctorId: string;
  username: string;
  password: string; // demo only — plain text in localStorage
  mustChangePassword: boolean;
  createdAt: string;
};

export type PatientStatus = "Active" | "Suspended";
export type Patient = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  status: PatientStatus;
  suspensionReason?: string;
  createdAt: string;
};

export type ReviewStatus = "Approved" | "Hidden" | "Pending";
export type ReviewItem = {
  id: string;
  doctorId: string;
  user: string;
  rating: number;
  text: string;
  textAr: string;
  status: ReviewStatus;
  createdAt: string;
};

type Store = {
  doctors: (Doctor & { approval: ApprovalStatus })[];
  specialties: (Specialty & { approval: ApprovalStatus })[];
  events: (EventItem & { approval: ApprovalStatus })[];
  videos: (VideoItem & { approval: ApprovalStatus })[];
  qa: (QAItem & { approval: ApprovalStatus })[];
  appointments: Appointment[];
  accounts: DoctorAccount[];
  patients: Patient[];
  reviews: ReviewItem[];
  session: { doctorId: string } | null;
};

const KEY = "zwara_admin_store_v1";

function seed(): Store {
  return {
    doctors: seedDoctors.map((d, i) => ({ ...d, approval: i === 0 ? "Pending" : "Approved" })),
    specialties: seedSpecs.map((s) => ({ ...s, approval: "Approved" })),
    events: seedEvents.map((e, i) => ({ ...e, approval: i < 2 ? "Pending" : "Approved" })),
    videos: seedVideos.map((v) => ({ ...v, approval: "Approved" })),
    qa: seedQA.map((q) => ({ ...q, approval: "Approved" })),
    appointments: [
      { id: "a1", doctorId: "d1", patient: "Anas", slot: "Tomorrow 10:00 AM", status: "Pending", createdAt: "1h ago" },
      { id: "a2", doctorId: "d1", patient: "Sara", slot: "Fri 11:30 AM", status: "Approved", createdAt: "3h ago" },
      { id: "a3", doctorId: "d2", patient: "Omar", slot: "Today 6:00 PM", status: "Pending", createdAt: "20m ago" },
      { id: "a4", doctorId: "d3", patient: "Layla", slot: "Tomorrow 9:00 AM", status: "Approved", createdAt: "1d ago" },
      { id: "a5", doctorId: "d4", patient: "Hassan", slot: "Today 7:00 PM", status: "Pending", createdAt: "10m ago" },
      { id: "a6", doctorId: "d1", patient: "Nadia", slot: "Last Mon 11:00 AM", status: "Completed", createdAt: "5d ago" },
    ],
    accounts: [],
    patients: [
      { id: "p1", name: "Anas Al-Aidan", phone: "+965 5000 1111", email: "anas@example.com", city: "Kuwait City", status: "Active", createdAt: new Date().toISOString() },
      { id: "p2", name: "Sara Al-Mutairi", phone: "+965 5000 2222", email: "sara@example.com", city: "Hawalli", status: "Active", createdAt: new Date().toISOString() },
      { id: "p3", name: "Omar Al-Rashid", phone: "+965 5000 3333", city: "Salmiya", status: "Active", createdAt: new Date().toISOString() },
      { id: "p4", name: "Layla Hassan", phone: "+965 5000 4444", email: "layla@example.com", city: "Jahra", status: "Suspended", suspensionReason: "Reported by multiple doctors for no-shows", createdAt: new Date().toISOString() },
      { id: "p5", name: "Hassan Al-Ali", phone: "+965 5000 5555", city: "Farwaniya", status: "Active", createdAt: new Date().toISOString() },
      { id: "p6", name: "Nadia Al-Sabah", phone: "+965 5000 6666", email: "nadia@example.com", city: "Kuwait City", status: "Active", createdAt: new Date().toISOString() },
    ],
    reviews: seedDoctors.flatMap((d, di) => d.reviews.map((r, ri) => ({
      id: `r_${d.id}_${ri}`,
      doctorId: d.id,
      user: r.user,
      rating: r.rating,
      text: r.text,
      textAr: r.textAr,
      status: (di === 0 && ri === 0 ? "Pending" : "Approved") as ReviewStatus,
      createdAt: new Date(Date.now() - (di * 3 + ri) * 86400000).toISOString(),
    }))),
    session: null,
  };
}

function load(): Store {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as Partial<Store>;
    const base = seed();
    return { ...base, ...parsed, accounts: parsed.accounts ?? [], patients: parsed.patients ?? base.patients, reviews: parsed.reviews ?? base.reviews, session: parsed.session ?? null };
  } catch {
    return seed();
  }
}

const listeners = new Set<() => void>();
let state: Store | null = null;

function getState(): Store {
  if (!state) state = load();
  return state;
}
function setState(updater: (s: Store) => Store) {
  state = updater(getState());
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export function useAdminStore() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return getState();
}

export const adminActions = {
  reset: () => setState(() => seed()),
  setApproval: <K extends "doctors" | "specialties" | "events" | "videos" | "qa">(
    kind: K, id: string, approval: ApprovalStatus,
  ) => setState((s) => ({ ...s, [kind]: (s[kind] as Array<{ id: string; approval: ApprovalStatus }>).map((x) => x.id === id ? { ...x, approval } : x) } as Store)),
  deleteItem: (kind: "doctors" | "specialties" | "events" | "videos" | "qa", id: string) =>
    setState((s) => ({ ...s, [kind]: (s[kind] as Array<{ id: string }>).filter((x) => x.id !== id) } as Store)),
  editDoctor: (id: string, patch: Partial<Doctor>) =>
    setState((s) => ({ ...s, doctors: s.doctors.map((d) => d.id === id ? { ...d, ...patch } : d) })),
  editSpecialty: (id: string, patch: Partial<Specialty>) =>
    setState((s) => ({ ...s, specialties: s.specialties.map((x) => x.id === id ? { ...x, ...patch } : x) })),
  editEvent: (id: string, patch: Partial<EventItem>) =>
    setState((s) => ({ ...s, events: s.events.map((x) => x.id === id ? { ...x, ...patch } : x) })),
  setApptStatus: (id: string, status: ApptStatus, note?: string) =>
    setState((s) => ({ ...s, appointments: s.appointments.map((a) => a.id === id ? { ...a, status, note: note ?? a.note } : a) })),
  addVideo: (video: Omit<VideoItem, "id"> & { id?: string }) =>
    setState((s) => {
      const id = video.id ?? `v_${Date.now()}`;
      return { ...s, videos: [{ ...video, id, approval: "Approved" as ApprovalStatus }, ...s.videos] };
    }),
  addSpecialty: (sp: Omit<Specialty, "id"> & { id?: string }) =>
    setState((s) => {
      const id = sp.id ?? `sp_${Date.now()}`;
      return { ...s, specialties: [{ ...sp, id, approval: "Approved" as ApprovalStatus }, ...s.specialties] };
    }),
  addEvent: (ev: Omit<EventItem, "id"> & { id?: string }) =>
    setState((s) => {
      const id = ev.id ?? `e_${Date.now()}`;
      return { ...s, events: [{ ...ev, id, approval: "Approved" as ApprovalStatus }, ...s.events] };
    }),
  addQA: (q: Omit<QAItem, "id"> & { id?: string }) =>
    setState((s) => {
      const id = q.id ?? `q_${Date.now()}`;
      return { ...s, qa: [{ ...q, id, approval: "Approved" as ApprovalStatus }, ...s.qa] };
    }),
  createDoctorAccount: (doctorId: string, username: string, password: string) =>
    setState((s) => {
      const uname = username.trim().toLowerCase();
      const others = s.accounts.filter((a) => a.doctorId !== doctorId);
      if (others.some((a) => a.username.toLowerCase() === uname)) {
        throw new Error("Username already taken");
      }
      const acc: DoctorAccount = { doctorId, username: uname, password, mustChangePassword: true, createdAt: new Date().toISOString() };
      return { ...s, accounts: [...others, acc] };
    }),
  removeDoctorAccount: (doctorId: string) =>
    setState((s) => ({ ...s, accounts: s.accounts.filter((a) => a.doctorId !== doctorId), session: s.session?.doctorId === doctorId ? null : s.session })),
  doctorLogin: (username: string, password: string): { ok: true; doctorId: string } | { ok: false; error: string } => {
    const s = getState();
    const acc = s.accounts.find((a) => a.username.toLowerCase() === username.trim().toLowerCase());
    if (!acc || acc.password !== password) return { ok: false, error: "Invalid username or password" };
    setState((st) => ({ ...st, session: { doctorId: acc.doctorId } }));
    return { ok: true, doctorId: acc.doctorId };
  },
  doctorLogout: () => setState((s) => ({ ...s, session: null })),
  changeDoctorPassword: (doctorId: string, newPassword: string) =>
    setState((s) => ({ ...s, accounts: s.accounts.map((a) => a.doctorId === doctorId ? { ...a, password: newPassword, mustChangePassword: false } : a) })),
  suspendPatient: (id: string, reason: string) =>
    setState((s) => ({ ...s, patients: s.patients.map((p) => p.id === id ? { ...p, status: "Suspended", suspensionReason: reason } : p) })),
  activatePatient: (id: string) =>
    setState((s) => ({ ...s, patients: s.patients.map((p) => p.id === id ? { ...p, status: "Active", suspensionReason: undefined } : p) })),
  deletePatient: (id: string) =>
    setState((s) => ({ ...s, patients: s.patients.filter((p) => p.id !== id) })),
  setReviewStatus: (id: string, status: ReviewStatus) =>
    setState((s) => ({ ...s, reviews: s.reviews.map((r) => r.id === id ? { ...r, status } : r) })),
  deleteReview: (id: string) =>
    setState((s) => ({ ...s, reviews: s.reviews.filter((r) => r.id !== id) })),
};
