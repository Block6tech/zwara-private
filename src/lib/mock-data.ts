export type Specialty = {
  id: string;
  name: string;
  icon: string; // lucide name
};

export const specialties: Specialty[] = [
  { id: "cardio", name: "Proctologist", icon: "HeartPulse" },
  { id: "derma", name: "Dermatology", icon: "Sparkles" },
  { id: "neuro", name: "Neurology", icon: "Brain" },
  { id: "pedia", name: "Pediatrics", icon: "Baby" },
  { id: "dental", name: "Dentistry", icon: "Smile" },
  { id: "ortho", name: "Orthopedics", icon: "Bone" },
  { id: "ophth", name: "Ophthalmology", icon: "Eye" },
  { id: "psych", name: "Psychiatry", icon: "BrainCog" },
];

export type Doctor = {
  id: string;
  name: string;
  nameAr: string;
  specialization: string;
  subspecialty: string;
  bio: string;
  bioAr: string;
  nationality: string;
  languages: string[];
  expertise: string[];
  experienceYears: number;
  affiliations: string[];
  degrees: string[];
  certifications: string[];
  education: { school: string; year: string }[];
  workHistory: { role: string; place: string; period: string }[];
  rating: number;
  reviewsCount: number;
  reviews: { user: string; rating: number; text: string; textAr: string }[];
  fee: number;
  city: string;
  avatarSeed: string;
  specialtyId: string;
  nextSlots: string[];
};

export const doctors: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Anas Al-Aidan", nameAr: "د. انس العيدان",
    specialization: "Proctologist",
    subspecialty: "Interventional Cardiology",
    bio: "Board-certified cardiologist focused on preventive care and minimally invasive procedures.",
    bioAr: "طبيب قلب معتمد يركز على الرعاية الوقائية والإجراءات طفيفة التوغل.",
    nationality: "Kuwaiti",
    languages: ["Arabic", "English", "French"],
    expertise: ["Echocardiography", "Stenting", "Heart failure"],
    experienceYears: 14,
    affiliations: ["Kuwait Heart Foundation", "European Society of Cardiology"],
    degrees: ["MBBCh", "MSc Cardiology", "PhD"],
    certifications: ["ESC Fellow", "Advanced Cardiac Life Support"],
    education: [
      { school: "Kuwait University, Faculty of Medicine", year: "2008" },
      { school: "Charité – Universitätsmedizin Berlin", year: "2014" },
    ],
    workHistory: [
      { role: "Consultant Cardiologist", place: "Chest Diseases Hospital, Kuwait", period: "2018 – Present" },
      { role: "Senior Registrar", place: "Mubarak Al-Kabeer Hospital", period: "2014 – 2018" },
    ],
    rating: 4.9,
    reviewsCount: 312,
    reviews: [
      { user: "Anas", rating: 5, text: "Very thorough and reassuring. Explained everything clearly.", textAr: "دقيق جداً ومطمئن. شرح كل شيء بوضوح." },
      { user: "User#19022", rating: 5, text: "Best cardiologist I've consulted. Highly recommended.", textAr: "أفضل طبيب قلب استشرته. أنصح به بشدة." },
      { user: "User#77312", rating: 4, text: "Great doctor, clinic was a bit busy.", textAr: "طبيب رائع، لكن العيادة كانت مزدحمة قليلاً." },
    ],
    fee: 35,
    city: "Kuwait City",
    avatarSeed: "layla",
    specialtyId: "cardio",
    nextSlots: ["Today 4:30 PM", "Tomorrow 10:00 AM", "Tomorrow 2:00 PM", "Fri 11:30 AM"],
  },
  {
    id: "d2",
    name: "Dr. Ali Alajmi", nameAr: "د. علي العجمي",
    specialization: "Dermatology",
    subspecialty: "Cosmetic Dermatology",
    bio: "Specializes in clinical and aesthetic dermatology with 10+ years of experience.",
    bioAr: "متخصص في الأمراض الجلدية السريرية والتجميلية بخبرة تزيد عن 10 سنوات.",
    nationality: "Kuwaiti",
    languages: ["Arabic", "English"],
    expertise: ["Acne", "Laser therapy", "Botox & fillers"],
    experienceYears: 11,
    affiliations: ["American Academy of Dermatology"],
    degrees: ["MD", "Diploma in Dermatology"],
    certifications: ["AAD Member", "Laser Safety Officer"],
    education: [{ school: "Kuwait University", year: "2012" }],
    workHistory: [
      { role: "Clinic Owner", place: "Glow Dermatology Center, Salmiya", period: "2019 – Present" },
    ],
    rating: 4.7,
    reviewsCount: 198,
    reviews: [
      { user: "User#22301", rating: 5, text: "Cleared my acne in 3 months.", textAr: "تخلصت من حب الشباب خلال 3 أشهر." },
      { user: "User#90234", rating: 4, text: "Professional and friendly staff.", textAr: "طاقم محترف وودود." },
    ],
    fee: 22,
    city: "Salmiya",
    avatarSeed: "omar",
    specialtyId: "derma",
    nextSlots: ["Today 6:00 PM", "Tomorrow 12:30 PM", "Thu 5:00 PM"],
  },
  {
    id: "d3",
    name: "Dr. Sara Al-Otaibi", nameAr: "د. سارة العتيبي",
    specialization: "Pediatrics",
    subspecialty: "Neonatology",
    bio: "Caring pediatrician dedicated to child wellness and developmental health.",
    bioAr: "طبيبة أطفال مهتمة بصحة الطفل وتطوره ونموه.",
    nationality: "Kuwaiti",
    languages: ["Arabic", "English", "French"],
    expertise: ["Newborn care", "Vaccinations", "Growth monitoring"],
    experienceYears: 9,
    affiliations: ["Kuwait Pediatric Society"],
    degrees: ["MD", "Pediatrics Board"],
    certifications: ["Neonatal Resuscitation Program"],
    education: [{ school: "Kuwait University, Faculty of Medicine", year: "2014" }],
    workHistory: [{ role: "Pediatrician", place: "Al-Adan Hospital", period: "2017 – Present" }],
    rating: 4.95,
    reviewsCount: 421,
    reviews: [
      { user: "User#11023", rating: 5, text: "Amazing with kids, very patient.", textAr: "رائعة مع الأطفال وصبورة جداً." },
    ],
    fee: 18,
    city: "Hawalli",
    avatarSeed: "sarah",
    specialtyId: "pedia",
    nextSlots: ["Tomorrow 9:00 AM", "Tomorrow 11:00 AM", "Wed 3:00 PM"],
  },
  {
    id: "d4",
    name: "Dr. Khalid Al-Mutairi", nameAr: "د. خالد المطيري",
    specialization: "Neurology",
    subspecialty: "Stroke & Vascular Neurology",
    bio: "Neurologist with expertise in stroke management and headache disorders.",
    bioAr: "طبيب أعصاب متخصص في إدارة السكتة الدماغية واضطرابات الصداع.",
    nationality: "Kuwaiti",
    languages: ["Arabic", "English"],
    expertise: ["Migraine", "Epilepsy", "Stroke care"],
    experienceYears: 16,
    affiliations: ["World Stroke Organization"],
    degrees: ["MBBCh", "MD Neurology"],
    certifications: ["WSO Fellow"],
    education: [{ school: "Kuwait University", year: "2006" }],
    workHistory: [{ role: "Head of Neurology", place: "Ibn Sina Hospital, Kuwait", period: "2020 – Present" }],
    rating: 4.8,
    reviewsCount: 254,
    reviews: [{ user: "User#55621", rating: 5, text: "Diagnosed quickly and accurately.", textAr: "تشخيص سريع ودقيق." }],
    fee: 40,
    city: "Kuwait City",
    avatarSeed: "karim",
    specialtyId: "neuro",
    nextSlots: ["Today 7:00 PM", "Fri 10:00 AM"],
  },
  {
    id: "d5",
    name: "Dr. Fajer Al-Esa", nameAr: "د. فجر العيسى",
    specialization: "Dentistry",
    subspecialty: "Orthodontics",
    bio: "Modern orthodontic care with clear aligners and braces.",
    bioAr: "رعاية تقويم أسنان حديثة باستخدام التقويم الشفاف والمعدني.",
    nationality: "Kuwaiti",
    languages: ["Arabic", "French", "English"],
    expertise: ["Invisalign", "Braces", "Smile design"],
    experienceYears: 8,
    affiliations: ["World Federation of Orthodontists"],
    degrees: ["BDS", "MSc Orthodontics"],
    certifications: ["Invisalign Certified Provider"],
    education: [{ school: "Kuwait University, Faculty of Dentistry", year: "2015" }],
    workHistory: [{ role: "Orthodontist", place: "Smile Studio, Jabriya", period: "2018 – Present" }],
    rating: 4.85,
    reviewsCount: 167,
    reviews: [{ user: "User#30021", rating: 5, text: "Loved my new smile!", textAr: "أحببت ابتسامتي الجديدة!" }],
    fee: 15,
    city: "Jabriya",
    avatarSeed: "nadia",
    specialtyId: "dental",
    nextSlots: ["Tomorrow 1:00 PM", "Sat 11:00 AM"],
  },
  {
    id: "d6",
    name: "Dr. Hassan Al-Maktoum", nameAr: "د. حسن آل مكتوم",
    specialization: "Orthopedics",
    subspecialty: "Sports Medicine",
    bio: "Sports orthopedic surgeon, knee & shoulder specialist.",
    bioAr: "جراح عظام رياضي ومتخصص في الركبة والكتف.",
    nationality: "Emirati",
    languages: ["Arabic", "English"],
    expertise: ["ACL reconstruction", "Arthroscopy", "Joint replacement"],
    experienceYears: 13,
    affiliations: ["FIFA Medical Network"],
    degrees: ["MD", "Fellowship Sports Medicine"],
    certifications: ["FIFA Diploma in Football Medicine"],
    education: [{ school: "UAE University", year: "2010" }],
    workHistory: [{ role: "Consultant", place: "Dubai Sports Hospital", period: "2019 – Present" }],
    rating: 4.75,
    reviewsCount: 142,
    reviews: [{ user: "User#90211", rating: 5, text: "Got me back to running in weeks.", textAr: "أعادني للجري خلال أسابيع." }],
    fee: 50,
    city: "Dubai",
    avatarSeed: "hassan",
    specialtyId: "ortho",
    nextSlots: ["Tomorrow 4:00 PM", "Mon 9:30 AM"],
  },
];

export type VideoItem = {
  id: string;
  title: string;
  channel: string;
  category: "Awareness" | "Documentaries" | "Campaigns";
  duration: string;
  thumbColor: string;
};

export const videos: VideoItem[] = [
  { id: "v1", title: "Understanding Hypertension: Silent Killer", channel: "WHO Health", category: "Awareness", duration: "8:42", thumbColor: "oklch(0.7 0.14 25)" },
  { id: "v2", title: "Diabetes Prevention in 5 Steps", channel: "Health Today", category: "Awareness", duration: "12:01", thumbColor: "oklch(0.72 0.13 175)" },
  { id: "v3", title: "Inside a Modern Hospital ICU", channel: "Med Docs", category: "Documentaries", duration: "45:20", thumbColor: "oklch(0.55 0.12 240)" },
  { id: "v4", title: "Vaccination Saves Lives — Campaign 2025", channel: "Ministry of Health", category: "Campaigns", duration: "2:15", thumbColor: "oklch(0.66 0.14 155)" },
  { id: "v5", title: "Mental Health: Breaking the Stigma", channel: "Mind Matters", category: "Awareness", duration: "14:30", thumbColor: "oklch(0.65 0.16 290)" },
  { id: "v6", title: "The Heart Surgery Revolution", channel: "Med Docs", category: "Documentaries", duration: "52:10", thumbColor: "oklch(0.62 0.18 15)" },
];

export type QAItem = {
  id: string;
  user: string;
  question: string;
  questionAr: string;
  answer?: { user: string; userAr: string; text: string; textAr: string };
  category: string;
  categoryAr: string;
  time: string;
  timeAr: string;
};

export const qaItems: QAItem[] = [
  { id: "q1", user: "Anas", question: "Is it normal to feel dizzy after starting blood pressure medication?", questionAr: "هل من الطبيعي الشعور بالدوار بعد البدء بدواء ضغط الدم؟", answer: { user: "Dr. Anas Al-Aidan", userAr: "د. أنس العيدان", text: "Yes, mild dizziness is common in the first week. If it persists, contact your doctor.", textAr: "نعم، الدوار الخفيف شائع في الأسبوع الأول. إذا استمر، تواصل مع طبيبك." }, category: "Proctologist", categoryAr: "جراحة القولون والمستقيم", time: "2h ago", timeAr: "قبل ساعتين" },
  { id: "q2", user: "User#90234", question: "What's the safest acne treatment for sensitive skin?", questionAr: "ما هو أأمن علاج لحب الشباب للبشرة الحساسة؟", answer: { user: "Dr. Omar Khalid", userAr: "د. عمر خالد", text: "Start with a gentle salicylic acid cleanser and a non-comedogenic moisturizer.", textAr: "ابدأ بمنظف لطيف يحتوي على حمض الساليسيليك ومرطب لا يسبب انسداد المسام." }, category: "Dermatology", categoryAr: "الجلدية", time: "5h ago", timeAr: "قبل 5 ساعات" },
  { id: "q3", user: "User#11023", question: "When should my baby get their first vaccinations?", questionAr: "متى يجب أن يحصل طفلي على أول تطعيماته؟", category: "Pediatrics", categoryAr: "طب الأطفال", time: "1d ago", timeAr: "قبل يوم" },
];

export type EventItem = {
  id: string;
  title: string;
  date: string;
  city: string;
  country: string;
  specialization: string;
  type: "Conference" | "Workshop" | "Webinar" | "Campaign";
  attendees: number;
};

export const events: EventItem[] = [
  { id: "e1", title: "Middle East Cardiology Summit 2026", date: "May 22, 2026", city: "Dubai", country: "UAE", specialization: "Proctologist", type: "Conference", attendees: 1200 },
  { id: "e2", title: "Pediatric Vaccination Awareness Day", date: "May 18, 2026", city: "London", country: "UK", specialization: "Pediatrics", type: "Campaign", attendees: 350 },
  { id: "e3", title: "Advanced Dermatology Workshop", date: "Jun 04, 2026", city: "Amman", country: "Jordan", specialization: "Dermatology", type: "Workshop", attendees: 80 },
  { id: "e4", title: "Mental Health Webinar: Anxiety in Youth", date: "May 30, 2026", city: "Online", country: "Global", specialization: "Psychiatry", type: "Webinar", attendees: 2400 },
  { id: "e5", title: "Sports Medicine Conference", date: "Jul 12, 2026", city: "Doha", country: "Qatar", specialization: "Orthopedics", type: "Conference", attendees: 600 },
];

export const countries = ["All", "UAE", "Egypt", "Jordan", "Qatar", "Lebanon", "Tunisia", "Global"];
export const allSpecs = ["All", ...Array.from(new Set(events.map((e) => e.specialization)))];
