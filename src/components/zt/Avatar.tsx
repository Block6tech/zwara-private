export function DoctorAvatar({ seed, name, size = 56 }: { seed: string; name: string; size?: number }) {
  // deterministic gradient from seed
  const hues = [195, 175, 220, 155, 25, 290, 75];
  const h1 = hues[seed.charCodeAt(0) % hues.length];
  const h2 = hues[(seed.charCodeAt(seed.length - 1) + 3) % hues.length];
  const initials = name
    .replace("Dr. ", "")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");
  return (
    <div
      className="flex items-center justify-center rounded-full text-primary-foreground font-semibold shadow-soft"
      style={{
        width: size,
        height: size,
        fontSize: size / 2.6,
        background: `linear-gradient(135deg, oklch(0.65 0.13 ${h1}), oklch(0.72 0.12 ${h2}))`,
      }}
    >
      {initials}
    </div>
  );
}
