// Builds ../about.html from about.md and renders figs/*.png for the editor.
//   node theory/build.mjs            rebuild the page and the figure images
//   node theory/build.mjs --no-figs  rebuild the page only
//   node theory/build.mjs --pdf      also print theory/about.pdf
//
// about.md is plain markdown with three additions:
//   ==Name==       a control name, drawn as a small key
//   `text`         monospace (strata, rank lists)
//   > [!figure]    a figure: one line of images, a blank line, then the caption
// Each image in a figure is labelled by its alt text. If figs.json has an entry for the image's file
// name, the page draws that figure live with the machine's meter code; otherwise it shows the image.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const PAGE = path.join(DIR, "..", "about.html");
const md = fs.readFileSync(path.join(DIR, "about.md"), "utf8");
const FIGS = JSON.parse(fs.readFileSync(path.join(DIR, "figs.json"), "utf8"));

const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const slug = s => s.toLowerCase().replace(/<[^>]+>|[*`=]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
function inline(s) {
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => `\0${codes.push(c) - 1}\0`);
  s = s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, "<i>$1</i>")
    .replace(/==(.+?)==/g, '<span class="ctl">$1</span>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return s.replace(/\0(\d+)\0/g, (_, i) => `<code>${esc(codes[i])}</code>`);
}

// ![label](figs/name.png), or Obsidian's ![[name.png|label]]
const IMG = /!\[((?:[^\]`]|`[^`]*`)*)\]\(([^)\s]+)\)|!\[\[([^|\]]+)(?:\|([^\]]*))?\]\]/g;
const wikiSrc = name => (fs.existsSync(path.join(DIR, "figs", name)) ? "figs/" + name : name);
function figure(lines) {
  const blank = lines.findIndex(l => !l.trim()), head = lines.slice(0, blank < 0 ? lines.length : blank).join(" ");
  const caption = blank < 0 ? "" : lines.slice(blank + 1).filter(l => l.trim()).join(" ");
  const imgs = [...head.matchAll(IMG)].map(m => {
    const src = m[2] || wikiSrc(m[3].trim()), label = m[3] ? m[4] || "" : m[1];
    return { label, src, spec: FIGS[path.basename(src)] };
  });
  const mcols = imgs.find(i => i.spec?.mcols)?.spec.mcols || imgs.length;
  const cells = imgs.map(({ label, src, spec }) => {
    const lab = label ? `<div class="lab">${inline(label)}</div>` : "";
    if (!spec) return `    <div class="cell"><img src="theory/${src}" alt="">${lab}</div>`;
    const cls = spec.fig.type === "bloom" ? "flower" : spec.fig.type, style = spec.style ? ` style="${spec.style}"` : "";
    const json = JSON.stringify(spec.fig).replace(/'/g, "&#39;");
    return `    <div class="cell"><canvas class="${cls}"${style} data-name="${path.basename(src)}" data-fig='${json}'></canvas>${lab}</div>`;
  });
  return [
    "<figure>",
    `  <div class="figs" style="--cols:${imgs.length};--mcols:${mcols}">`,
    ...cells,
    "  </div>",
    ...(caption ? [`  <figcaption>${inline(caption)}</figcaption>`] : []),
    "</figure>",
  ].join("\n");
}

// ---- blocks ----
const out = [], toc = [];
let inSection = false, afterH1 = false;
const blocks = md.replace(/^---\n[\s\S]*?\n---\n/, "")
  .replace(/^((?!- |>).+)\n(?=- )/gm, "$1\n\n")   // a list may start right under a paragraph
  .split(/\n\s*\n/).map(b => b.replace(/\s+$/, "")).filter(Boolean);
for (const b of blocks) {
  const lines = b.split("\n");
  if (b.startsWith("# ")) {
    // anything above the title (the TL;DR key) goes in a panel of its own
    if (out.length) out.splice(0, out.length, '<aside class="key">', ...out, "</aside>");
    out.push(`<h1>${inline(b.slice(2))}</h1>`); afterH1 = true; continue;
  }
  if (b.startsWith("## ")) {
    const title = b.slice(3).trim(), id = slug(title), n = String(toc.length + 1).padStart(2, "0");
    if (inSection) out.push("</section>");
    out.push("", `<section id="${id}">`, `<h2><span class="n">${n}</span>${inline(title)}</h2>`);
    toc.push(`  <a href="#${id}"><span class="n">${n}</span>${inline(title)}</a>`);
    inSection = true; afterH1 = false;
    continue;
  }
  if (b.startsWith("### ")) { out.push(`<h3>${inline(b.slice(4))}</h3>`); continue; }
  if (b.startsWith(">")) {
    const q = lines.map(l => l.replace(/^>\s?/, ""));
    if (/^\[!figure\]/i.test(q[0])) out.push(figure(q.slice(1)));
    else out.push(`<blockquote><p>${inline(q.join(" "))}</p></blockquote>`);
    continue;
  }
  if (b.startsWith("- ")) {
    const items = b.split(/\n(?=- )/).map(l => `  <li>${inline(l.slice(2).replace(/\n\s*/g, " "))}</li>`);
    out.push(["<ul>", ...items, "</ul>"].join("\n"));
    continue;
  }
  const text = lines.join(" ").trim();
  if (/^`[^`]+`$/.test(text)) out.push(`<p class="ranks">${esc(text.slice(1, -1))}</p>`);
  else out.push(`<p${afterH1 ? ' class="lede"' : ""}>${inline(text)}</p>`);
  afterH1 = false;
}
if (inSection) out.push("</section>");

const between = (s, tag, body) => {
  const a = `<!-- ${tag} -->`, z = `<!-- /${tag} -->`, i = s.indexOf(a), j = s.indexOf(z);
  if (i < 0 || j < 0) throw new Error(`about.html is missing the ${a} … ${z} markers`);
  return s.slice(0, i + a.length) + "\n" + body + "\n" + s.slice(j);
};
let page = fs.readFileSync(PAGE, "utf8");
page = between(page, "toc", toc.join("\n"));
page = between(page, "content", out.join("\n"));
fs.writeFileSync(PAGE, page);
console.log(`about.html: ${toc.length} sections, ${(page.match(/<figure>/g) || []).length} figures`);

// ---- PDF of the page, through Chrome's print stylesheet ----
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if (process.argv.includes("--pdf")) {
  const pdf = path.join(DIR, "about.pdf");
  execFileSync(CHROME, ["--headless", "--disable-gpu", "--window-size=680,1200", "--force-device-scale-factor=2", "--virtual-time-budget=8000",
    "--no-pdf-header-footer", "--print-to-pdf=" + pdf, "file://" + PAGE], { stdio: "ignore" });
  console.log("about.pdf written");
}

// ---- figure images, drawn by the page itself in headless Chrome ----
if (process.argv.includes("--no-figs")) process.exit(0);
const dom = execFileSync(CHROME, [
  "--headless", "--disable-gpu", "--hide-scrollbars", "--window-size=1280,1000", "--force-device-scale-factor=2",
  "--virtual-time-budget=8000", "--dump-dom", "file://" + PAGE + "#export",
], { encoding: "utf8", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "ignore"] });
const json = [...dom.matchAll(/<pre id="export">([\s\S]*?)<\/pre>/g)].pop();   // the last one; the first is in the script
if (!json) throw new Error("Chrome did not return the figures");
const shots = JSON.parse(json[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
fs.mkdirSync(path.join(DIR, "figs"), { recursive: true });
for (const [name, url] of Object.entries(shots)) fs.writeFileSync(path.join(DIR, "figs", name), Buffer.from(url.split(",")[1], "base64"));
console.log(`figs/: ${Object.keys(shots).length} images`);
