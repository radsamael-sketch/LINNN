import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lingo Studio — личная студия английского" },
      { name: "description", content: "Lingo Studio: личная студия английского — уроки, практика, чтение, тесты и прогресс." },
      { name: "theme-color", content: "#fffaf5" },
      { property: "og:title", content: "Lingo Studio — личная студия английского" },
      { property: "og:description", content: "Уроки, словарь с карточками, тесты и прогресс от A1+ до B2." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  links: () => [
    { rel: "manifest", href: "/manifest.webmanifest" },
    { rel: "icon", href: "/icons/icon-192.png", type: "image/png" },
  ],
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/lingo.html"
      title="Lingo Studio"
      className="fixed inset-0 h-screen w-screen border-0"
    />
  );
}
