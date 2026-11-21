/*
 * Übersicht aller Lerntools für die Startseite.
 *
 * So fügst du ein neues Tool hinzu:
 * 1. Lege einen neuen Ordner an, z. B. "klimadiagramm/index.html".
 * 2. Ergänze unten einen Eintrag mit status: "ready" (oder "soon").
 */
window.GEO_TOOLS = [
  {
    id: "erdkugel",
    title: "Erdkugel: Tag und Nacht",
    shortText: "Drehe die Erde und sieh, wo gerade Tag oder Nacht ist.",
    highlights: [
      { icon: "sun", label: "Tag & Nacht" },
      { icon: "calendar", label: "Jahreszeiten" },
      { icon: "pin", label: "Orte suchen" }
    ],
    status: "ready",
    statusLabel: "Bereit",
    ctaLabel: "Erdkugel starten",
    href: "./erdkugel/erdkugel-tag-nacht.html",
    featured: true,
    visual: "day-night"
  }
];
