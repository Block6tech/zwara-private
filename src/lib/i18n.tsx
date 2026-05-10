import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type Lang = "en" | "ar";

type Dict = Record<string, string>;

const en: Dict = {
  // Tabs
  "tab.home": "Home",
  "tab.awareness": "Awareness",
  "tab.events": "Events",
  // Common
  "common.back": "Back",
  "common.seeAll": "See all",
  "common.results": "results",
  "common.fee": "Consultation fee",
  "common.kwd": "KWD",
  "common.viewDetails": "View details",
  "common.country": "Country",
  "common.specialty": "Specialty",
  "common.all": "All",
  // Home
  "home.welcomeBack": "Welcome back",
  "home.title.find": "Find your",
  "home.title.doctor": "trusted doctor",
  "home.subtitle": "Book appointments easily, anytime.",
  "home.search": "Search doctor or specialty",
  "home.upcoming": "Upcoming appointment",
  "home.specialties": "Specialties",
  "home.topDoctors": "Top doctors",
  "home.noResults": "No doctors match your search.",
  "home.years": "y",
  // Doctor
  "doctor.about": "About",
  "doctor.reviews": "Reviews",
  "doctor.experience": "Experience",
  "doctor.patients": "Patients",
  "doctor.rating": "Rating",
  "doctor.nationality": "Nationality",
  "doctor.languages": "Languages",
  "doctor.expertise": "Areas of Expertise",
  "doctor.affiliations": "Affiliations",
  "doctor.degrees": "Degrees & Certifications",
  "doctor.education": "Education",
  "doctor.workHistory": "Work History",
  "doctor.availableSlots": "Available slots",
  "doctor.selectSlot": "Select a slot",
  "doctor.book": "Book",
  // Booking
  "booking.confirm": "Confirm booking",
  "booking.review": "Review your appointment details",
  "booking.dateTime": "Date & time",
  "booking.location": "Location",
  "booking.locationClinic": "clinic",
  "booking.feeLabel": "Fee",
  "booking.reason": "Reason (optional)",
  "booking.reasonPlaceholder": "Briefly describe symptoms...",
  "booking.notice": "Your request will be sent to the doctor for review. You'll be notified when approved or rescheduled.",
  "booking.confirmBtn": "Confirm booking",
  "booking.sentTitle": "Booking sent to doctor",
  "booking.sentDesc": "You'll be notified once reviewed.",
  // Register / OTP
  "register.title": "Continue as patient",
  "register.subtitle": "Enter your full name and phone number — we'll send a one-time code to verify.",
  "register.phone": "Phone number",
  "register.fullName": "Full name",
  "register.fullNamePlaceholder": "e.g. Anas Al-Ali",
  "register.send": "Send code",
  "register.terms": "By continuing you agree to Zwara Tabeya's Terms & Privacy.",
  "otp.title": "Verify your number",
  "otp.codeSent": "Code sent to",
  "otp.notReceived": "Didn't receive?",
  "otp.resend": "Resend in 30s",
  "otp.verify": "Verify & continue",
  "otp.welcome": "Welcome to Zwara Tabeya!",
  // Awareness
  "aw.title": "Health Awareness",
  "aw.videos": "Video Library",
  "aw.qa": "Anonymous Q&A",
  "aw.askAnon": "Ask a question anonymously",
  "aw.postedAs": "Posted as",
  "aw.awaiting": "Awaiting answer from a doctor...",
  "aw.cat.Awareness": "Awareness",
  "aw.cat.Documentaries": "Documentaries",
  "aw.cat.Campaigns": "Campaigns",
  // Events
  "ev.title": "Health Events",
  "ev.subtitle": "Conferences, workshops & campaigns near you",
  "ev.none": "No events match these filters.",
  "ev.type.Conference": "Conference",
  "ev.type.Workshop": "Workshop",
  "ev.type.Webinar": "Webinar",
  "ev.type.Campaign": "Campaign",
  // Bookings
  "bk.title": "My bookings",
  "bk.subtitle": "Track your appointment status",
  "bk.none": "No bookings yet.",
  "bk.awaitingDoctor": "Awaiting doctor's confirmation...",
  "status.Pending": "Pending",
  "status.Approved": "Approved",
  "status.Rescheduled": "Rescheduled",
  "status.Rejected": "Rejected",
  "status.Completed": "Completed",
  "status.Cancelled": "Cancelled",
  // Profile
  "profile.guest": "Guest",
  "profile.patient": "Patient",
  "profile.accountType": "Account type",
  "profile.guestType": "Guest (browse only)",
  "profile.verified": "Verified patient",
  "profile.phone": "Phone",
  "profile.memberSince": "Member since",
  "profile.memberSinceVal": "May 2026",
  // Help
  "help.title": "Help Center",
  "help.subtitle": "We're here to help, 24/7.",
  "help.q1": "How do I book an appointment?",
  "help.q2": "Can I reschedule or cancel?",
  "help.q3": "How does anonymous Q&A work?",
  "help.q4": "Is my data safe?",
  "help.q5": "Contact support",
  // Side menu
  "menu.guest": "Guest user",
  "menu.welcome": "Welcome back",
  "menu.signup": "Sign up / Log in",
  "menu.profile": "My profile",
  "menu.bookings": "My bookings",
  "menu.language": "Language",
  "menu.help": "Help Center",
  "menu.tagline": "v1.0 · Healthcare made simple",
  // Specialties
  "spec.cardio": "Proctologist",
  "spec.derma": "Dermatology",
  "spec.neuro": "Neurology",
  "spec.pedia": "Pediatrics",
  "spec.dental": "Dentistry",
  "spec.ortho": "Orthopedics",
  "spec.ophth": "Ophthalmology",
  "spec.psych": "Psychiatry",
  // Countries
  "country.All": "All",
  "country.UAE": "UAE",
  "country.Egypt": "Egypt",
  "country.Jordan": "Jordan",
  "country.Qatar": "Qatar",
  "country.Lebanon": "Lebanon",
  "country.Tunisia": "Tunisia",
  "country.Global": "Global",
};

const ar: Dict = {
  "tab.home": "الرئيسية",
  "tab.awareness": "التوعية",
  "tab.events": "الفعاليات",
  "common.back": "رجوع",
  "common.seeAll": "عرض الكل",
  "common.results": "نتيجة",
  "common.fee": "رسوم الاستشارة",
  "common.kwd": "د.ك",
  "common.viewDetails": "عرض التفاصيل",
  "common.country": "الدولة",
  "common.specialty": "التخصص",
  "common.all": "الكل",
  "home.welcomeBack": "أهلاً بعودتك",
  "home.title.find": "ابحث عن",
  "home.title.doctor": "طبيبك الموثوق",
  "home.subtitle": "احجز موعدك بسهولة في أي وقت.",
  "home.search": "ابحث عن طبيب أو تخصص",
  "home.upcoming": "موعد قادم",
  "home.specialties": "التخصصات",
  "home.topDoctors": "أفضل الأطباء",
  "home.noResults": "لا يوجد أطباء مطابقون لبحثك.",
  "home.years": "سنة",
  "doctor.about": "نبذة",
  "doctor.reviews": "التقييمات",
  "doctor.experience": "الخبرة",
  "doctor.patients": "المرضى",
  "doctor.rating": "التقييم",
  "doctor.nationality": "الجنسية",
  "doctor.languages": "اللغات",
  "doctor.expertise": "مجالات الخبرة",
  "doctor.affiliations": "الانتماءات",
  "doctor.degrees": "الشهادات والاعتمادات",
  "doctor.education": "التعليم",
  "doctor.workHistory": "السيرة المهنية",
  "doctor.availableSlots": "المواعيد المتاحة",
  "doctor.selectSlot": "اختر موعداً",
  "doctor.book": "احجز",
  "booking.confirm": "تأكيد الحجز",
  "booking.review": "راجع تفاصيل الموعد",
  "booking.dateTime": "التاريخ والوقت",
  "booking.location": "الموقع",
  "booking.locationClinic": "عيادة",
  "booking.feeLabel": "الرسوم",
  "booking.reason": "السبب (اختياري)",
  "booking.reasonPlaceholder": "صف الأعراض باختصار...",
  "booking.notice": "سيتم إرسال طلبك إلى الطبيب للمراجعة. سنُعلمك عند الموافقة أو إعادة الجدولة.",
  "booking.confirmBtn": "تأكيد الحجز",
  "booking.sentTitle": "تم إرسال الحجز إلى الطبيب",
  "booking.sentDesc": "سنُعلمك بمجرد المراجعة.",
  "register.title": "متابعة كمريض",
  "register.subtitle": "أدخل اسمك الكامل ورقم هاتفك — سنرسل لك رمز تحقق لمرة واحدة.",
  "register.phone": "رقم الهاتف",
  "register.fullName": "الاسم الكامل",
  "register.fullNamePlaceholder": "مثال: أنس العلي",
  "register.send": "إرسال الرمز",
  "register.terms": "بالمتابعة، فإنك توافق على شروط وخصوصية زوارة طبية.",
  "otp.title": "تحقق من رقمك",
  "otp.codeSent": "تم إرسال الرمز إلى",
  "otp.notReceived": "لم يصلك الرمز؟",
  "otp.resend": "إعادة الإرسال خلال 30 ثانية",
  "otp.verify": "تحقق ومتابعة",
  "otp.welcome": "أهلاً بك في زوارة طبية!",
  "aw.title": "التوعية الصحية",
  "aw.videos": "مكتبة الفيديو",
  "aw.qa": "أسئلة وأجوبة مجهولة",
  "aw.askAnon": "اطرح سؤالاً بشكل مجهول",
  "aw.postedAs": "نُشر باسم",
  "aw.awaiting": "بانتظار إجابة من طبيب...",
  "aw.cat.Awareness": "توعية",
  "aw.cat.Documentaries": "وثائقيات",
  "aw.cat.Campaigns": "حملات",
  "ev.title": "فعاليات صحية",
  "ev.subtitle": "مؤتمرات وورش وحملات بالقرب منك",
  "ev.none": "لا توجد فعاليات مطابقة لهذه التصفية.",
  "ev.type.Conference": "مؤتمر",
  "ev.type.Workshop": "ورشة",
  "ev.type.Webinar": "ندوة",
  "ev.type.Campaign": "حملة",
  "bk.title": "حجوزاتي",
  "bk.subtitle": "تابع حالة موعدك",
  "bk.none": "لا توجد حجوزات بعد.",
  "bk.awaitingDoctor": "بانتظار تأكيد الطبيب...",
  "status.Pending": "قيد الانتظار",
  "status.Approved": "مقبول",
  "status.Rescheduled": "أُعيد جدولته",
  "status.Rejected": "مرفوض",
  "status.Completed": "مكتمل",
  "status.Cancelled": "ملغى",
  "profile.guest": "زائر",
  "profile.patient": "مريض",
  "profile.accountType": "نوع الحساب",
  "profile.guestType": "زائر (تصفح فقط)",
  "profile.verified": "مريض موثّق",
  "profile.phone": "الهاتف",
  "profile.memberSince": "عضو منذ",
  "profile.memberSinceVal": "مايو 2026",
  "help.title": "مركز المساعدة",
  "help.subtitle": "نحن هنا للمساعدة على مدار الساعة.",
  "help.q1": "كيف أحجز موعداً؟",
  "help.q2": "هل يمكنني إعادة الجدولة أو الإلغاء؟",
  "help.q3": "كيف تعمل الأسئلة المجهولة؟",
  "help.q4": "هل بياناتي آمنة؟",
  "help.q5": "تواصل مع الدعم",
  "menu.guest": "حساب زائر",
  "menu.welcome": "أهلاً بعودتك",
  "menu.signup": "إنشاء حساب / تسجيل الدخول",
  "menu.profile": "ملفي الشخصي",
  "menu.bookings": "حجوزاتي",
  "menu.language": "اللغة",
  "menu.help": "مركز المساعدة",
  "menu.tagline": "الإصدار 1.0 · الرعاية الصحية بكل بساطة",
  "spec.cardio": "جراح القولون والمستقيم",
  "spec.derma": "الجلدية",
  "spec.neuro": "أمراض الأعصاب",
  "spec.pedia": "طب الأطفال",
  "spec.dental": "طب الأسنان",
  "spec.ortho": "العظام",
  "spec.ophth": "العيون",
  "spec.psych": "الطب النفسي",
  "country.All": "الكل",
  "country.UAE": "الإمارات",
  "country.Egypt": "لندن",
  "country.Jordan": "الأردن",
  "country.Qatar": "قطر",
  "country.Lebanon": "لبنان",
  "country.Tunisia": "تونس",
  "country.Global": "عالمي",
};

const dicts: Record<Lang, Dict> = { en, ar };

type I18nCtx = {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: string, fallback?: string) => string;
};

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const saved = window.localStorage.getItem("zt.lang") as Lang | null;
    return saved === "ar" || saved === "en" ? saved : "en";
  });

  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      window.localStorage.setItem("zt.lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang, dir]);

  const value = useMemo<I18nCtx>(
    () => ({
      lang,
      dir,
      setLang: setLangState,
      toggle: () => setLangState((l) => (l === "en" ? "ar" : "en")),
      t: (key, fallback) => dicts[lang][key] ?? fallback ?? key,
    }),
    [lang, dir],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
