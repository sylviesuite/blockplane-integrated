// src/lib/loadMaterials.ts
import type { Material } from "../types";

export async function loadMaterials(): Promise<Material[]> {
  // Cache-bust per build (uses commit on Netlify if provided)
  const v = import.meta.env.VITE_BUILD_VERSION ?? Date.now();
  const url = `./data/materials.v2.json?v=${encodeURIComponent(String(v))}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const text = await res.text();

  // Sanitize control chars ONLY while inside JSON string tokens.
  // Handles raw newlines and other U+0000..U+001F even if they slipped into quotes.
  let out = "";
  let inStr = false;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (!inStr) {
      out += ch;
      if (ch === '"') inStr = true;
      continue;
    }

    // We are inside a string
    if (escaped) {
      out += ch;           // keep escaped char as-is
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      out += ch;
      escaped = true;
      continue;
    }

    if (ch === '"') {
      out += ch;
      inStr = false;
      continue;
    }

    const code = ch.charCodeAt(0);
    if (code >= 0x00 && code <= 0x1f) {
      out += `\\u${code.toString(16).padStart(4, "0")}`;
    } else {
      out += ch;
    }
  }

  return JSON.parse(out) as Material[];
}
