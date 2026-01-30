// scripts/sanitize-json.mjs
import fs from "node:fs";
import path from "node:path";

// Directories to clean
const roots = ["public/data"];

// Matches JSON string tokens, handling escapes: " ... "
const STRING_RE = /"([^"\\]|\\.)*"/g;
// Control chars 0x00-0x1F (including \n, \r, \t)
const CTRL_RE = /[\u0000-\u001F]/g;

function sanitizeJsonStringsOnly(text) {
  return text.replace(STRING_RE, (str) => {
    // str still includes the outer quotes; preserve them
    const inner = str.slice(1, -1);
    const cleanedInner = inner.replace(CTRL_RE, (c) =>
      `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`
    );
    return `"${cleanedInner}"`;
  });
}

let changed = 0;
for (const root of roots) {
  if (!fs.existsSync(root)) continue;
  for (const f of fs.readdirSync(root)) {
    if (!f.endsWith(".json")) continue;
    const p = path.join(root, f);
    const txt = fs.readFileSync(p, "utf8");
    const cleaned = sanitizeJsonStringsOnly(txt);
    if (cleaned !== txt) {
      // Validate we didn’t break JSON
      try { JSON.parse(cleaned); } catch (e) {
        console.error(`❌ ${p}: sanitizer produced invalid JSON: ${e.message}`);
        process.exit(1);
      }
      fs.writeFileSync(p, cleaned, "utf8");
      console.log(`sanitized(strings): ${p}`);
      changed++;
    }
  }
}
console.log(changed ? `✅ sanitized ${changed} file(s)` : "✅ no changes needed");
