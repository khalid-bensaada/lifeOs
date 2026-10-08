import en from "../src/i18n/en.js";
import ar from "../src/i18n/ar.js";
import fr from "../src/i18n/fr.js";

const base = Object.keys(en);
let problems = 0;

for (const [name, messages] of Object.entries({ ar, fr })) {
  const keys = Object.keys(messages);
  const missing = base.filter((k) => !keys.includes(k));
  const extra = keys.filter((k) => !base.includes(k));
  missing.forEach((k) => console.log(`${name}: missing "${k}"`));
  extra.forEach((k) => console.log(`${name}: unknown key "${k}"`));
  problems += missing.length + extra.length;
}

if (problems) {
  console.log(`\n${problems} problem(s) found.`);
  process.exitCode = 1;
} else {
  console.log(`All ${base.length} keys exist in en, ar and fr.`);
}
