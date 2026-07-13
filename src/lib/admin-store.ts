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

type Store = {
  doctors: (Doctor & { approval: ApprovalStatus })[];
  specialties: (Specialty & { approval: ApprovalStatus })[];
  events: (EventItem & { approval: ApprovalStatus })[];
  videos: (VideoItem & { approval: ApprovalStatus })[];
  qa: (QAItem & { approval: ApprovalStatus })[];
  appointments: Appointment[];
  accounts: DoctorAccount[];
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
  };
}

function load(): Store {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    return JSON.parse(raw) as Store;
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
};
