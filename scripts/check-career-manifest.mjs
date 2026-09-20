import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "data", "career-public.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const errors = [];
const warnings = [];

function required(value, label) {
  if (typeof value !== "string" || !value.trim()) errors.push(`missing ${label}`);
}

required(manifest?.release?.careerEpoch, "release.careerEpoch");
required(manifest?.release?.verifiedAt, "release.verifiedAt");
required(manifest?.profile?.email, "profile.email");

if (manifest?.profile?.email !== "jiaming.wei.ai@outlook.com") {
  errors.push("profile.email is not the current permanent professional contact");
}

const verified = new Date(`${manifest?.release?.verifiedAt}T00:00:00Z`);
if (Number.isNaN(verified.getTime())) {
  errors.push("release.verifiedAt is not a valid YYYY-MM-DD date");
} else {
  const ageDays = Math.floor((Date.now() - verified.getTime()) / 86_400_000);
  if (ageDays > 45) {
    warnings.push(`career public facts were last verified ${ageDays} days ago; review before a recruiter-facing release`);
  }
}

const checkedFiles = [
  "data/career-public.json",
  "app/home-content.ts",
  "app/page.tsx",
  "app/layout.tsx",
  "app/resume/page.tsx",
  "app/showcase/page.tsx",
];

const banned = [
  "jimmyenglish@126.com",
  "REALM + NeurIPS VLM4RWD submitted",
  "目前在 Holistic AI 做 Research Intern",
  "2 个 2026 workshop submission",
];

for (const relative of checkedFiles) {
  const full = path.join(root, relative);
  const text = fs.readFileSync(full, "utf8");
  for (const stale of banned) {
    if (text.includes(stale)) errors.push(`${relative} still contains stale recruiter-facing claim: ${stale}`);
  }
}

const retiredPublicCvs = [
  "public/resume/Jiaming_Wei_CV_EVAL_CN_v1.0.pdf",
  "public/resume/Jiaming_Wei_CV_EVAL_EN_v1.0.pdf",
];

for (const relative of retiredPublicCvs) {
  if (fs.existsSync(path.join(root, relative))) {
    errors.push(`${relative} is a retired 2026-08 recruiter-facing binary; use /resume until a fresh binary is deliberately published`);
  }
}

if (!fs.existsSync(path.join(root, "app", "resume", "page.tsx"))) {
  errors.push("current recruiter-facing /resume route is missing");
}

if (!fs.existsSync(path.join(root, "app", "showcase", "page.tsx"))) {
  errors.push("research /showcase route is missing");
}

required(manifest?.showcase?.posterTitle?.en, "showcase.posterTitle.en");
required(manifest?.showcase?.event?.en, "showcase.event.en");
required(manifest?.showcase?.publicArtifacts?.portfolioPdf, "showcase.publicArtifacts.portfolioPdf");

const showcaseEvidence = manifest?.evidence?.find((item) => item?.title?.en === "Research Poster & Showcase");
if (showcaseEvidence?.href !== "/showcase") {
  errors.push("Research Poster & Showcase evidence must resolve to the first-party /showcase surface");
}

const serialized = JSON.stringify(manifest);
if (!serialized.includes("EMNLP 2026 Workshop REALM")) {
  errors.push("REALM acceptance must name the workshop explicitly");
}
if (serialized.includes("Accepted at EMNLP 2026\"") || serialized.includes("Accepted at EMNLP 2026,”")) {
  errors.push("REALM claim is ambiguous with EMNLP main-conference acceptance");
}

for (const warning of warnings) console.warn(`career manifest warning: ${warning}`);

if (errors.length) {
  for (const error of errors) console.error(`career manifest error: ${error}`);
  process.exit(1);
}

console.log(
  `Career manifest OK: ${manifest.release.careerEpoch}, verified ${manifest.release.verifiedAt}, ${manifest.featured.length} featured projects, ${manifest.evidence.length} evidence surfaces.`
);
