import landscape from "@/assets/landscape2.jpg";

// Self-contained SVG silhouette in the app's palette (wheat on dark green).
// Inlined as a data URI so the default avatar never depends on an external host.
const avatarSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>" +
  "<rect width='100' height='100' fill='#021603'/>" +
  "<circle cx='50' cy='40' r='16' fill='#f5deb3'/>" +
  "<path d='M22 84c0-15 12-24 28-24 16 0 28 9 28 24z' fill='#f5deb3'/>" +
  "</svg>";

export const DEFAULT_AVATAR = `data:image/svg+xml,${encodeURIComponent(avatarSvg)}`;

// Local asset bundled by Vite — no external hotlink to break.
export const DEFAULT_BANNER = landscape;
