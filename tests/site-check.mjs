import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8') + fs.readFileSync(path.join(root, 'interactions.js'), 'utf8');

assert.match(html, /<title>[^<]+<\/title>/, 'page title is required');
assert.match(html, /meta name="description"[^>]+content="[^"]+"/, 'meta description is required');
assert.match(html, /<h1[\s\S]*<\/h1>/, 'a primary heading is required');
assert.match(html, /<img[^>]+alt="[^"]+"/, 'images need alternative text');
assert.match(html, /id="technologies"/, 'technology section is required');
assert.match(html, /id="certifications"/, 'certification section is required');
assert.doesNotMatch(html, /id="agent-lab"/, 'removed laboratory must not return');
assert.match(script, /data-tech-filter/, 'technology filter behavior is required');
assert.match(script, /dialog.showModal/, 'native project detail dialog is required');
assert.match(script, /prefers-reduced-motion/, 'reduced-motion support is required');
assert.match(html, /CV_Salma_Ihssan_PFE_2027\.pdf/, 'current CV link is required');
for (const credential of ['credly.com/badges/5400a7d5-89d5-49b1-a71e-8aaf54b0e48b', 'huggingface.co/datasets/agents-course/certificates', 'datacamp.com/completed/statement-of-accomplishment/course/d9899d355a320f40cf53a182390254703f7ba7d4', 'datacamp.com/completed/statement-of-accomplishment/course/df306e396b22c0705bb246458791d503b68e1644', 'academy.claude.com/verify/88cbe4e292344c2d66c1b2365d3fd516']) {
  assert.match(html, new RegExp(credential.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `credential link is missing: ${credential}`);
}
assert.doesNotMatch(html, /cdn\.simpleicons|cdn\.jsdelivr\.net\/gh\/devicons/, 'technology logos should be locally vendored');
for (const asset of fs.readdirSync(path.join(root, 'assets', 'logos'))) {
  assert.ok(html.includes(`assets/logos/${asset}`), `vendored logo is not referenced: ${asset}`);
}
for (const technology of ['Python', 'LangGraph', 'MCP', 'PyTorch', 'FastAPI', 'Docker', 'Power BI']) {
  assert.match(html, new RegExp(`>${technology}<`), `technology is missing: ${technology}`);
}

for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const target = match[1];
  if (/^(#|https?:|mailto:|data:|javascript:)/i.test(target)) continue;
  const localPath = decodeURIComponent(target.split(/[?#]/)[0]);
  assert.ok(fs.existsSync(path.join(root, localPath)), `local target is missing: ${target}`);
}

for (const [, key] of html.matchAll(/data-i18n="([^"]+)"/g)) {
  assert.ok(script.includes(`${key}:`) || script.includes(`.${key} =`), `translation key is missing: ${key}`);
}

assert.equal((html.match(/target="_blank"/g) ?? []).length, (html.match(/rel="noreferrer"/g) ?? []).length, 'external links must use noreferrer');
console.log('site-check: passed');
