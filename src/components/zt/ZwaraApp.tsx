import { useMemo, useState } from "react";
import {
  Home, Calendar, PlayCircle, Menu, Search, Star, MapPin, Clock, ArrowLeft,
  HeartPulse, Sparkles, Brain, Baby, Smile, Bone, Eye, BrainCog, Bell,
  Globe, LifeBuoy, BookmarkCheck, User as UserIcon, X, Phone,
  MessageCircleQuestion, Filter, Languages, ChevronRight, Award, Briefcase,
  GraduationCap, BadgeCheck, Users, Video,
} from "lucide-react";
import { doctors, specialties, videos, qaItems, events, countries, allSpecs, type Doctor } from "@/lib/mock-data";
import { DoctorAvatar } from "./Avatar";
import { MobileShell } from "./MobileShell";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  HeartPulse, Sparkles, Brain, Baby, Smile, Bone, Eye, BrainCog,
};

type Tab = "home" | "awareness" | "events";
type Screen =
  | { name: "tabs" }
  | { name: "doctor"; id: string }
  | { name: "booking"; id: string; slot: string }
  | { name: "register" }
  | { name: "otp"; phone: string }
  | { name: "bookings" }
  | { name: "profile" }
  | { name: "help" };

type BookingStatus = "Pending" | "Approved" | "Rescheduled" | "Rejected" | "Completed" | "Cancelled";
type Booking = { id: string; doctorId: string; slot: string; status: BookingStatus; createdAt: string };

const STATUS_STYLES: Record<BookingStatus, string> = {
  Pending: "bg-warning/15 text-warning-foreground border-warning/30",
  Approved: "bg-success/15 text-success border-success/30",
  Rescheduled: "bg-primary-soft text-primary border-primary/30",
  Rejected: "bg-destructive/10 text-destructive border-destructive/30",
  Completed: "bg-muted text-muted-foreground border-border",
  Cancelled: "bg-muted text-muted-foreground border-border",
};

// Back chevron that flips for RTL
function BackIcon({ className = "" }: { className?: string }) {
  return <ArrowLeft className={`${className} rtl:rotate-180`} />;
}

// Localized doctor name based on current language
function dName(d: { name: string; nameAr: string }, lang: string) {
  return lang === "ar" ? d.nameAr : d.name;
}

export function ZwaraApp() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("home");
  const [screen, setScreen] = useState<Screen>({ name: "tabs" });
  const [menuOpen, setMenuOpen] = useState(false);
  const [isGuest, setIsGuest] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([
    { id: "b0", doctorId: "d3", slot: "Tomorrow 9:00 AM", status: "Approved", createdAt: "2h ago" },
    { id: "b-1", doctorId: "d1", slot: "Last Mon 11:00 AM", status: "Completed", createdAt: "5d ago" },
  ]);
  const [userTag] = useState("Anas");

  const doctor = screen.name === "doctor" || screen.name === "booking"
    ? doctors.find((d) => d.id === (screen as { id: string }).id) ?? null
    : null;

  return (
    <MobileShell>
      {/* Status bar */}
      <div className="h-6 md:h-8 px-6 pt-2 flex items-center justify-between text-[11px] font-semibold text-foreground/80">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <span>●●●●</span>
          <span>5G</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {screen.name === "tabs" && (
          <>
            {tab === "home" && (
              <HomeTab
                onOpenDoctor={(id) => setScreen({ name: "doctor", id })}
                onOpenMenu={() => setMenuOpen(true)}
                userTag={userTag}
                bookings={bookings}
              />
            )}
            {tab === "awareness" && <AwarenessTab onOpenMenu={() => setMenuOpen(true)} userTag={userTag} />}
            {tab === "events" && <EventsTab onOpenMenu={() => setMenuOpen(true)} />}
          </>
        )}

        {screen.name === "doctor" && doctor && (
          <DoctorScreen
            doctor={doctor}
            onBack={() => setScreen({ name: "tabs" })}
            onBook={(slot) => {
              if (isGuest) setScreen({ name: "register" });
              else setScreen({ name: "booking", id: doctor.id, slot });
            }}
          />
        )}
        {screen.name === "booking" && doctor && (
          <BookingConfirm
            doctor={doctor}
            slot={screen.slot}
            onBack={() => setScreen({ name: "doctor", id: doctor.id })}
            onConfirm={() => {
              const nb: Booking = {
                id: "b" + Date.now(),
                doctorId: doctor.id,
                slot: screen.slot,
                status: "Pending",
                createdAt: "just now",
              };
              setBookings((b) => [nb, ...b]);
              toast.success(t("booking.sentTitle"), { description: t("booking.sentDesc") });
              setScreen({ name: "bookings" });
            }}
          />
        )}
        {screen.name === "register" && (
          <RegisterScreen
            onBack={() => setScreen({ name: "tabs" })}
            onSubmit={(phone) => setScreen({ name: "otp", phone })}
          />
        )}
        {screen.name === "otp" && (
          <OtpScreen
            phone={screen.phone}
            onBack={() => setScreen({ name: "register" })}
            onVerified={() => {
              setIsGuest(false);
              toast.success(t("otp.welcome"));
              setScreen({ name: "tabs" });
            }}
          />
        )}
        {screen.name === "bookings" && (
          <BookingsScreen bookings={bookings} onBack={() => setScreen({ name: "tabs" })} />
        )}
        {screen.name === "profile" && (
          <ProfileScreen userTag={userTag} isGuest={isGuest} onBack={() => setScreen({ name: "tabs" })} />
        )}
        {screen.name === "help" && <HelpScreen onBack={() => setScreen({ name: "tabs" })} />}
      </div>

      {screen.name === "tabs" && (
        <nav className="border-t border-border bg-card/80 backdrop-blur px-2 py-2 pb-3 flex items-center justify-around">
          {[
            { id: "home" as const, key: "tab.home", icon: Home },
            { id: "awareness" as const, key: "tab.awareness", icon: PlayCircle },
            { id: "events" as const, key: "tab.events", icon: Calendar },
          ].map((tt) => {
            const active = tab === tt.id;
            const Icon = tt.icon;
            return (
              <button
                key={tt.id}
                onClick={() => setTab(tt.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${active ? "bg-primary-soft" : ""}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">{t(tt.key)}</span>
              </button>
            );
          })}
        </nav>
      )}

      {menuOpen && (
        <SideMenu
          userTag={userTag}
          isGuest={isGuest}
          onClose={() => setMenuOpen(false)}
          onNav={(s) => {
            setMenuOpen(false);
            setScreen(s);
          }}
          onLogin={() => {
            setMenuOpen(false);
            setScreen({ name: "register" });
          }}
        />
      )}
    </MobileShell>
  );
}

/* ---------------- HOME ---------------- */
function HomeTab({
  onOpenDoctor, onOpenMenu, userTag, bookings,
}: { onOpenDoctor: (id: string) => void; onOpenMenu: () => void; userTag: string; bookings: Booking[] }) {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState("");
  const [activeSpec, setActiveSpec] = useState<string | null>(null);
  const filtered = useMemo(
    () =>
      doctors.filter(
        (d) =>
          (!activeSpec || d.specialtyId === activeSpec) &&
          (query === "" ||
            d.name.toLowerCase().includes(query.toLowerCase()) ||
            d.specialization.toLowerCase().includes(query.toLowerCase())),
      ),
    [query, activeSpec],
  );
  const upcoming = bookings.find((b) => b.status === "Pending" || b.status === "Approved");
  const upcomingDoc = upcoming ? doctors.find((d) => d.id === upcoming.doctorId) : null;
  const activeSpecName = activeSpec ? t(`spec.${activeSpec}`) : "";

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <header className="px-5 pt-3 pb-4 bg-gradient-hero">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onOpenMenu} className="p-2 -ms-2 rounded-xl hover:bg-card/60">
            <Menu className="w-6 h-6 text-foreground" />
          </button>
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground">{t("home.welcomeBack")}</p>
            <p className="text-sm font-semibold">{userTag}</p>
          </div>
          <button className="p-2 -me-2 rounded-xl hover:bg-card/60 relative">
            <Bell className="w-6 h-6 text-foreground" />
            <span className="absolute top-2 end-2 w-2 h-2 rounded-full bg-destructive" />
          </button>
        </div>
        <h1 className="text-2xl font-bold tracking-tight leading-tight">
          {t("home.title.find")} <span className="text-primary">{t("home.title.doctor")}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("home.subtitle")}</p>

        <div className="mt-4 relative">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("home.search")}
            className="w-full ps-10 pe-4 py-3.5 rounded-2xl bg-card border border-border text-sm shadow-soft outline-none focus:border-primary transition-colors"
          />
        </div>
      </header>

      {upcomingDoc && upcoming && (
        <section className="px-5 mt-2">
          <div className="rounded-2xl p-4 bg-gradient-primary text-primary-foreground shadow-card flex items-center gap-3">
            <DoctorAvatar seed={upcomingDoc.avatarSeed} name={upcomingDoc.name} size={48} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] opacity-90 uppercase tracking-wide">{t("home.upcoming")}</p>
              <p className="font-semibold truncate">{upcomingDoc.name}</p>
              <p className="text-xs opacity-90 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {upcoming.slot}
              </p>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full bg-card/20 backdrop-blur font-medium">
              {t(`status.${upcoming.status}`)}
            </span>
          </div>
        </section>
      )}

      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">{t("home.specialties")}</h2>
          <button className="text-xs text-primary font-medium">{t("common.seeAll")}</button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {specialties.slice(0, 8).map((s) => {
            const Icon = iconMap[s.icon];
            const active = activeSpec === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSpec(active ? null : s.id)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${
                  active ? "bg-primary text-primary-foreground shadow-card" : "bg-card border border-border hover:border-primary/40"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? "bg-card/20" : "bg-primary-soft"}`}>
                  <Icon className={`w-5 h-5 ${active ? "text-primary-foreground" : "text-primary"}`} />
                </div>
                <span className="text-[10px] font-medium leading-tight text-center">{t(`spec.${s.id}`)}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">{t("home.topDoctors")}{activeSpec && ` · ${activeSpecName}`}</h2>
          <span className="text-xs text-muted-foreground">{filtered.length} {t("common.results")}</span>
        </div>
        <div className="space-y-3">
          {filtered.map((d) => (
            <DoctorCard key={d.id} doctor={d} onClick={() => onOpenDoctor(d.id)} />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-sm text-muted-foreground">{t("home.noResults")}</div>
          )}
        </div>
      </section>
    </div>
  );
}

function DoctorCard({ doctor, onClick }: { doctor: Doctor; onClick: () => void }) {
  const { t, lang } = useI18n();
  return (
    <button
      onClick={onClick}
      className="w-full text-start bg-card border border-border rounded-2xl p-3.5 shadow-soft hover:shadow-card hover:border-primary/30 transition-all flex gap-3"
    >
      <DoctorAvatar seed={doctor.avatarSeed} name={doctor.name} size={60} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold truncate">{doctor.name}</p>
          <div className="flex items-center gap-1 text-xs">
            <Star className="w-3.5 h-3.5 fill-warning text-warning" />
            <span className="font-semibold">{doctor.rating}</span>
          </div>
        </div>
        <p className="text-xs text-primary font-medium">{doctor.specialization}</p>
        <p className="text-[11px] text-muted-foreground truncate">{doctor.subspecialty}</p>
        <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{doctor.city}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{doctor.experienceYears}{t("home.years")}</span>
          <span className="ms-auto font-semibold text-foreground">{doctor.fee} {t("common.kwd")}</span>
        </div>
      </div>
    </button>
  );
}

/* ---------------- DOCTOR DETAIL ---------------- */
function DoctorScreen({ doctor, onBack, onBook }: { doctor: Doctor; onBack: () => void; onBook: (slot: string) => void }) {
  const { t, lang } = useI18n();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [tab, setTab] = useState<"about" | "reviews">("about");
  return (
    <div className="flex-1 overflow-y-auto pb-28">
      <div className="px-5 pt-2 pb-4 bg-gradient-hero">
        <button onClick={onBack} className="p-2 -ms-2 rounded-xl hover:bg-card/60">
          <BackIcon className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4 mt-2">
          <DoctorAvatar seed={doctor.avatarSeed} name={doctor.name} size={84} />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold leading-tight">{doctor.name}</h2>
            <p className="text-sm text-primary font-medium">{doctor.specialization}</p>
            <p className="text-xs text-muted-foreground">{doctor.subspecialty}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs">
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-warning text-warning" />{doctor.rating} ({doctor.reviewsCount})</span>
              <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3 h-3" />{doctor.city}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <Stat label={t("doctor.experience")} value={`${doctor.experienceYears}${t("home.years")}`} />
          <Stat label={t("doctor.patients")} value={`${doctor.reviewsCount * 4}+`} />
          <Stat label={t("doctor.rating")} value={`${doctor.rating}/5`} />
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className="flex items-center gap-2 bg-secondary p-1 rounded-xl">
          {(["about", "reviews"] as const).map((tt) => (
            <button
              key={tt}
              onClick={() => setTab(tt)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === tt ? "bg-card shadow-soft text-foreground" : "text-muted-foreground"
              }`}
            >
              {t(`doctor.${tt}`)}
            </button>
          ))}
        </div>
      </div>

      {tab === "about" ? (
        <div className="px-5 mt-4 space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">{doctor.bio}</p>

          <InfoRow icon={Globe} label={t("doctor.nationality")} value={doctor.nationality} />
          <InfoRow icon={Languages} label={t("doctor.languages")} value={doctor.languages.join(" · ")} />

          <Section title={t("doctor.expertise")} icon={BadgeCheck}>
            <div className="flex flex-wrap gap-2">
              {doctor.expertise.map((e) => (
                <span key={e} className="text-xs px-2.5 py-1 rounded-full bg-primary-soft text-primary font-medium">{e}</span>
              ))}
            </div>
          </Section>

          <Section title={t("doctor.affiliations")} icon={Users}>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {doctor.affiliations.map((a) => <li key={a}>• {a}</li>)}
            </ul>
          </Section>

          <Section title={t("doctor.degrees")} icon={Award}>
            <div className="flex flex-wrap gap-2">
              {[...doctor.degrees, ...doctor.certifications].map((c) => (
                <span key={c} className="text-xs px-2.5 py-1 rounded-lg bg-secondary border border-border">{c}</span>
              ))}
            </div>
          </Section>

          <Section title={t("doctor.education")} icon={GraduationCap}>
            {doctor.education.map((e) => (
              <div key={e.school} className="flex justify-between text-sm py-1">
                <span>{e.school}</span>
                <span className="text-muted-foreground">{e.year}</span>
              </div>
            ))}
          </Section>

          <Section title={t("doctor.workHistory")} icon={Briefcase}>
            {doctor.workHistory.map((w) => (
              <div key={w.role} className="text-sm py-1.5 border-s-2 border-primary/30 ps-3 mb-2">
                <p className="font-medium">{w.role}</p>
                <p className="text-xs text-muted-foreground">{w.place} · {w.period}</p>
              </div>
            ))}
          </Section>
        </div>
      ) : (
        <div className="px-5 mt-4 space-y-3">
          {doctor.reviews.map((r, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 shadow-soft">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold">{r.user}</p>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className={`w-3.5 h-3.5 ${idx < r.rating ? "fill-warning text-warning" : "text-muted"}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      )}

      <div className="px-5 mt-6">
        <h3 className="font-semibold mb-3">{t("doctor.availableSlots")}</h3>
        <div className="grid grid-cols-2 gap-2">
          {doctor.nextSlots.map((slot) => {
            const sel = selectedSlot === slot;
            return (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`p-3 rounded-xl text-sm font-medium border transition-all ${
                  sel ? "bg-primary text-primary-foreground border-primary shadow-card" : "bg-card border-border hover:border-primary/40"
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 start-0 end-0 p-4 bg-card/95 backdrop-blur border-t border-border">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="text-muted-foreground">{t("common.fee")}</span>
          <span className="font-bold">{doctor.fee} {t("common.kwd")}</span>
        </div>
        <button
          disabled={!selectedSlot}
          onClick={() => selectedSlot && onBook(selectedSlot)}
          className="w-full py-3.5 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold shadow-card disabled:opacity-40 disabled:shadow-none transition-all"
        >
          {selectedSlot ? `${t("doctor.book")} ${selectedSlot}` : t("doctor.selectSlot")}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card rounded-xl p-2.5 text-center border border-border shadow-soft">
      <p className="text-base font-bold text-primary">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
    </div>
  );
}
function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <div className="ps-1">{children}</div>
    </div>
  );
}

/* ---------------- BOOKING CONFIRM ---------------- */
function BookingConfirm({ doctor, slot, onBack, onConfirm }: { doctor: Doctor; slot: string; onBack: () => void; onConfirm: () => void }) {
  const { t, lang } = useI18n();
  const [reason, setReason] = useState("");
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-5 pt-2 pb-4">
        <button onClick={onBack} className="p-2 -ms-2 rounded-xl"><BackIcon className="w-5 h-5" /></button>
        <h2 className="text-xl font-bold mt-2">{t("booking.confirm")}</h2>
        <p className="text-sm text-muted-foreground">{t("booking.review")}</p>
      </div>
      <div className="px-5 space-y-4">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-soft flex gap-3 items-center">
          <DoctorAvatar seed={doctor.avatarSeed} name={doctor.name} size={56} />
          <div>
            <p className="font-semibold">{doctor.name}</p>
            <p className="text-xs text-primary">{doctor.specialization}</p>
            <p className="text-xs text-muted-foreground">{doctor.subspecialty}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl divide-y divide-border shadow-soft">
          <Row label={t("booking.dateTime")} value={slot} />
          <Row label={t("booking.location")} value={`${doctor.city} ${t("booking.locationClinic")}`} />
          <Row label={t("booking.feeLabel")} value={`${doctor.fee} ${t("common.kwd")}`} />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("booking.reason")}</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("booking.reasonPlaceholder")}
            rows={3}
            className="mt-2 w-full p-3 rounded-2xl bg-card border border-border text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="text-xs text-muted-foreground bg-primary-soft/50 p-3 rounded-xl">
          {t("booking.notice")}
        </div>
      </div>
      <div className="p-4 mt-4">
        <button onClick={onConfirm} className="w-full py-3.5 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold shadow-card">
          {t("booking.confirmBtn")}
        </button>
      </div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

/* ---------------- REGISTER + OTP ---------------- */
function RegisterScreen({ onBack, onSubmit }: { onBack: () => void; onSubmit: (phone: string) => void }) {
  const { t } = useI18n();
  const [phone, setPhone] = useState("");
  return (
    <div className="flex-1 overflow-y-auto px-5 pt-2">
      <button onClick={onBack} className="p-2 -ms-2 rounded-xl"><BackIcon className="w-5 h-5" /></button>
      <div className="mt-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-4 shadow-card">
          <Phone className="w-6 h-6 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold">{t("register.title")}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t("register.subtitle")}</p>
      </div>
      <div className="mt-6">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("register.phone")}</label>
        <div className="mt-2 flex items-center gap-2 p-3 rounded-2xl bg-card border border-border focus-within:border-primary" dir="ltr">
          <span className="text-sm font-semibold">+965</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
            placeholder="9XX XXXXX"
            inputMode="numeric"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
      </div>
      <button
        disabled={phone.length < 10}
        onClick={() => onSubmit(phone)}
        className="w-full mt-6 py-3.5 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold shadow-card disabled:opacity-40"
      >
        {t("register.send")}
      </button>
      <p className="text-[11px] text-muted-foreground text-center mt-4">
        {t("register.terms")}
      </p>
    </div>
  );
}
function OtpScreen({ phone, onBack, onVerified }: { phone: string; onBack: () => void; onVerified: () => void }) {
  const { t } = useI18n();
  const [code, setCode] = useState(["", "", "", ""]);
  const full = code.join("");
  return (
    <div className="flex-1 overflow-y-auto px-5 pt-2">
      <button onClick={onBack} className="p-2 -ms-2 rounded-xl"><BackIcon className="w-5 h-5" /></button>
      <div className="mt-4">
        <h2 className="text-2xl font-bold">{t("otp.title")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t("otp.codeSent")} <span className="font-medium text-foreground" dir="ltr">+965 {phone}</span>
        </p>
      </div>
      <div className="flex gap-3 mt-8 justify-center" dir="ltr">
        {code.map((c, i) => (
          <input
            key={i}
            value={c}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(-1);
              const nc = [...code];
              nc[i] = v;
              setCode(nc);
              if (v && i < 3) {
                const next = document.getElementById(`otp-${i + 1}`);
                next?.focus();
              }
            }}
            id={`otp-${i}`}
            inputMode="numeric"
            maxLength={1}
            className="w-14 h-16 text-center text-2xl font-bold rounded-2xl bg-card border border-border focus:border-primary outline-none"
          />
        ))}
      </div>
      <p className="text-xs text-center mt-4 text-muted-foreground">
        {t("otp.notReceived")} <button className="text-primary font-medium">{t("otp.resend")}</button>
      </p>
      <button
        disabled={full.length < 4}
        onClick={onVerified}
        className="w-full mt-8 py-3.5 rounded-2xl bg-gradient-primary text-primary-foreground font-semibold shadow-card disabled:opacity-40"
      >
        {t("otp.verify")}
      </button>
    </div>
  );
}

/* ---------------- AWARENESS ---------------- */
function AwarenessTab({ onOpenMenu, userTag }: { onOpenMenu: () => void; userTag: string }) {
  const { t } = useI18n();
  const [section, setSection] = useState<"videos" | "qa">("videos");
  const [cat, setCat] = useState<"All" | "Awareness" | "Documentaries" | "Campaigns">("All");
  const filtered = videos.filter((v) => cat === "All" || v.category === cat);
  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <header className="px-5 pt-3 pb-4 bg-gradient-hero">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onOpenMenu} className="p-2 -ms-2"><Menu className="w-6 h-6" /></button>
          <h1 className="font-bold">{t("aw.title")}</h1>
          <div className="w-10" />
        </div>
        <div className="flex items-center gap-2 bg-card p-1 rounded-xl border border-border">
          {(["videos", "qa"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                section === s ? "bg-gradient-primary text-primary-foreground shadow-soft" : "text-muted-foreground"
              }`}
            >
              {s === "videos" ? t("aw.videos") : t("aw.qa")}
            </button>
          ))}
        </div>
      </header>

      {section === "videos" ? (
        <>
          <div className="px-5 mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {(["All", "Awareness", "Documentaries", "Campaigns"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
                  cat === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"
                }`}
              >
                {c === "All" ? t("common.all") : t(`aw.cat.${c}`)}
              </button>
            ))}
          </div>
          <div className="px-5 mt-4 space-y-4">
            {filtered.map((v) => (
              <div key={v.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
                <div
                  className="h-36 relative flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${v.thumbColor}, oklch(0.4 0.08 240))` }}
                >
                  <PlayCircle className="w-14 h-14 text-card drop-shadow-lg" />
                  <span className="absolute bottom-2 end-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-foreground/70 text-background">
                    {v.duration}
                  </span>
                  <span className="absolute top-2 start-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-card/90 text-foreground">
                    {t(`aw.cat.${v.category}`)}
                  </span>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm leading-snug">{v.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Video className="w-3 h-3" /> {v.channel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="px-5 mt-4 space-y-3">
          <button className="w-full p-4 rounded-2xl bg-gradient-primary text-primary-foreground text-start shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-card/20 flex items-center justify-center">
                <MessageCircleQuestion className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">{t("aw.askAnon")}</p>
                <p className="text-xs opacity-90">{t("aw.postedAs")} {userTag}</p>
              </div>
            </div>
          </button>
          {qaItems.map((q) => (
            <div key={q.id} className="bg-card border border-border rounded-2xl p-4 shadow-soft">
              <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{q.user}</span>
                <span>{q.time} · {q.category}</span>
              </div>
              <p className="text-sm font-medium leading-relaxed">{q.question}</p>
              {q.answer ? (
                <div className="mt-3 p-3 rounded-xl bg-primary-soft border-s-2 border-primary">
                  <p className="text-xs font-semibold text-primary">{q.answer.user}</p>
                  <p className="text-sm mt-1 leading-relaxed">{q.answer.text}</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-2 italic">{t("aw.awaiting")}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- EVENTS ---------------- */
function EventsTab({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { t } = useI18n();
  const [country, setCountry] = useState("All");
  const [spec, setSpec] = useState("All");
  const filtered = events.filter(
    (e) => (country === "All" || e.country === country) && (spec === "All" || e.specialization === spec),
  );

  const specToKey: Record<string, string> = {
    Cardiology: "cardio", Dermatology: "derma", Neurology: "neuro", Pediatrics: "pedia",
    Dentistry: "dental", Orthopedics: "ortho", Ophthalmology: "ophth", Psychiatry: "psych",
  };
  const labelCountry = (c: string) => t(`country.${c}`, c);
  const labelSpec = (s: string) =>
    s === "All" ? t("common.all") : (specToKey[s] ? t(`spec.${specToKey[s]}`) : s);

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <header className="px-5 pt-3 pb-4 bg-gradient-hero">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onOpenMenu} className="p-2 -ms-2"><Menu className="w-6 h-6" /></button>
          <h1 className="font-bold">{t("ev.title")}</h1>
          <button className="p-2 -me-2"><Filter className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-muted-foreground">{t("ev.subtitle")}</p>
      </header>

      <div className="px-5 mt-4 space-y-2">
        <FilterChips label={t("common.country")} options={countries} value={country} onChange={setCountry} renderLabel={labelCountry} />
        <FilterChips label={t("common.specialty")} options={allSpecs} value={spec} onChange={setSpec} renderLabel={labelSpec} />
      </div>

      <div className="px-5 mt-5 space-y-3">
        {filtered.map((e) => (
          <div key={e.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
            <div className="p-4 flex gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex flex-col items-center justify-center text-primary-foreground flex-shrink-0" dir="ltr">
                <span className="text-[9px] font-semibold uppercase">{e.date.split(" ")[0]}</span>
                <span className="text-lg font-bold leading-none">{e.date.split(" ")[1].replace(",", "")}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-soft text-primary">{t(`ev.type.${e.type}`)}</span>
                  <span className="text-[10px] text-muted-foreground">{labelSpec(e.specialization)}</span>
                </div>
                <p className="font-semibold text-sm leading-snug">{e.title}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.city}, {labelCountry(e.country)}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{e.attendees}</span>
                </div>
              </div>
            </div>
            <button className="w-full py-2.5 text-sm font-semibold text-primary border-t border-border hover:bg-primary-soft transition-colors">
              {t("common.viewDetails")}
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-sm text-muted-foreground">{t("ev.none")}</div>
        )}
      </div>
    </div>
  );
}
function FilterChips({ label, options, value, onChange, renderLabel }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void; renderLabel?: (v: string) => string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5">{label}</p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
              value === o ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"
            }`}
          >
            {renderLabel ? renderLabel(o) : o}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- BOOKINGS ---------------- */
function BookingsScreen({ bookings, onBack }: { bookings: Booking[]; onBack: () => void }) {
  const { t, lang } = useI18n();
  return (
    <div className="flex-1 overflow-y-auto px-5 pt-2 pb-6">
      <button onClick={onBack} className="p-2 -ms-2"><BackIcon className="w-5 h-5" /></button>
      <h2 className="text-2xl font-bold mt-2">{t("bk.title")}</h2>
      <p className="text-sm text-muted-foreground">{t("bk.subtitle")}</p>
      <div className="mt-5 space-y-3">
        {bookings.map((b) => {
          const d = doctors.find((x) => x.id === b.doctorId);
          if (!d) return null;
          return (
            <div key={b.id} className="bg-card border border-border rounded-2xl p-4 shadow-soft">
              <div className="flex gap-3 items-center">
                <DoctorAvatar seed={d.avatarSeed} name={d.name} size={48} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{d.name}</p>
                  <p className="text-xs text-primary">{d.specialization}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />{b.slot}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[b.status]}`}>
                  {t(`status.${b.status}`)}
                </span>
              </div>
              {b.status === "Pending" && (
                <p className="text-[11px] text-muted-foreground mt-3 italic">{t("bk.awaitingDoctor")}</p>
              )}
            </div>
          );
        })}
        {bookings.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">{t("bk.none")}</div>
        )}
      </div>
    </div>
  );
}

/* ---------------- PROFILE / HELP ---------------- */
function ProfileScreen({ userTag, isGuest, onBack }: { userTag: string; isGuest: boolean; onBack: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex-1 overflow-y-auto px-5 pt-2 pb-6">
      <button onClick={onBack} className="p-2 -ms-2"><BackIcon className="w-5 h-5" /></button>
      <div className="flex flex-col items-center mt-4">
        <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-card">
          {isGuest ? "G" : "P"}
        </div>
        <h2 className="text-xl font-bold mt-3">{isGuest ? t("profile.guest") : t("profile.patient")}</h2>
        <p className="text-sm text-muted-foreground">{userTag}</p>
      </div>
      <div className="mt-6 bg-card border border-border rounded-2xl divide-y divide-border shadow-soft">
        <Row label={t("profile.accountType")} value={isGuest ? t("profile.guestType") : t("profile.verified")} />
        <Row label={t("profile.phone")} value={isGuest ? "—" : "+965 9••• 4567"} />
        <Row label={t("profile.memberSince")} value={t("profile.memberSinceVal")} />
      </div>
    </div>
  );
}
function HelpScreen({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const items = [t("help.q1"), t("help.q2"), t("help.q3"), t("help.q4"), t("help.q5")];
  return (
    <div className="flex-1 overflow-y-auto px-5 pt-2 pb-6">
      <button onClick={onBack} className="p-2 -ms-2"><BackIcon className="w-5 h-5" /></button>
      <h2 className="text-2xl font-bold mt-2">{t("help.title")}</h2>
      <p className="text-sm text-muted-foreground">{t("help.subtitle")}</p>
      <div className="mt-5 space-y-2">
        {items.map((it) => (
          <button key={it} className="w-full p-4 bg-card border border-border rounded-2xl flex items-center justify-between shadow-soft hover:border-primary/40 transition-colors text-start">
            <span className="text-sm font-medium">{it}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground rtl:rotate-180" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- SIDE MENU ---------------- */
function SideMenu({
  userTag, isGuest, onClose, onNav, onLogin,
}: {
  userTag: string;
  isGuest: boolean;
  onClose: () => void;
  onNav: (s: Screen) => void;
  onLogin: () => void;
}) {
  const { t, lang, toggle } = useI18n();
  return (
    <div className="absolute inset-0 z-40 flex">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative w-72 bg-card h-full shadow-float flex flex-col animate-in slide-in-from-left rtl:slide-in-from-right duration-200">
        <div className="p-5 bg-gradient-primary text-primary-foreground">
          <div className="flex justify-between items-start">
            <div className="w-14 h-14 rounded-full bg-card/20 flex items-center justify-center text-xl font-bold">
              {isGuest ? "G" : "P"}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-card/20"><X className="w-5 h-5" /></button>
          </div>
          <p className="font-semibold mt-3">{isGuest ? t("menu.guest") : t("menu.welcome")}</p>
          <p className="text-xs opacity-90">{userTag}</p>
          {isGuest && (
            <button onClick={onLogin} className="mt-3 w-full py-2 rounded-xl bg-card text-primary text-sm font-semibold shadow-soft">
              {t("menu.signup")}
            </button>
          )}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <MenuItem icon={UserIcon} label={t("menu.profile")} onClick={() => onNav({ name: "profile" })} />
          <MenuItem icon={BookmarkCheck} label={t("menu.bookings")} onClick={() => onNav({ name: "bookings" })} />
          <MenuItem
            icon={Languages}
            label={`${t("menu.language")}: ${lang === "en" ? "English" : "العربية"}`}
            onClick={toggle}
          />
          <MenuItem icon={LifeBuoy} label={t("menu.help")} onClick={() => onNav({ name: "help" })} />
        </nav>
        <div className="p-4 border-t border-border text-center">
          <p className="text-sm font-bold text-primary">Zwara Tabeya</p>
          <p className="text-[10px] text-muted-foreground">{t("menu.tagline")}</p>
        </div>
      </aside>
    </div>
  );
}
function MenuItem({ icon: Icon, label, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-start">
      <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="w-4 h-4 text-muted-foreground rtl:rotate-180" />
    </button>
  );
}
