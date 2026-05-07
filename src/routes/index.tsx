import { createFileRoute } from "@tanstack/react-router";
import { ZwaraApp } from "@/components/zt/ZwaraApp";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zwara Tabeya — Find & book trusted doctors" },
      { name: "description", content: "Discover doctors by specialty, book appointments, watch health awareness videos, and join health events — all in one place." },
      { property: "og:title", content: "Zwara Tabeya — Healthcare made simple" },
      { property: "og:description", content: "Browse doctors, book appointments, learn from health awareness content, and discover events near you." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <ZwaraApp />
      <Toaster position="top-center" />
    </>
  );
}
