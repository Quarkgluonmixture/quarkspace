// Recruiter-facing personal-site content is projected from one public-safe manifest.
// Career facts are reconciled upstream in JobFinder / Career OS; this file is the
// implementation/type boundary for the public site. Do not reintroduce a second
// hand-maintained copy of those facts here.

import careerManifest from "../data/career-public.json";

export type Lang = "zh" | "en";
export type Localized = { zh: string; en: string };

export type Featured = {
  slot: string;
  kicker: Localized;
  title: Localized;
  who: Localized[];
  lead: Localized;
  points?: Localized[];
  stack: string;
  href: string;
  goLabel?: Localized;
  span: "c12" | "c7" | "c6" | "c5";
  wide?: boolean;
  bigTitle?: boolean;
  shot?: { src: string; alt: Localized; cap: Localized };
  pull?: Localized;
  chart?: "cost";
  cap?: Localized;
};

export type Experience = {
  id: string;
  org: string;
  role: Localized;
  lead: Localized;
  points: Localized[];
  tags: string[];
};

export type Evidence = {
  id: string;
  title: Localized;
  status: Localized;
  text: Localized;
  href: string;
  action: Localized;
};

export type Skill = {
  k: Localized;
  v: Localized;
};

export type LabItem = {
  name: string;
  year: string;
  text: Localized;
  href: string;
};

export type Showcase = {
  event: Localized;
  posterTitle: Localized;
  posterSubtitle: Localized;
  people: Localized;
  example: {
    task: Localized;
    read: { label: string; value: string; outcome: Localized };
    look: { label: string; value: string; outcome: Localized };
    note: Localized;
  };
  findings: { no: string; title: Localized; text: Localized }[];
  publicArtifacts: {
    portfolioPage: string;
    portfolioPdf: string;
    demo: string;
    repo: string;
  };
  disclosure: Localized;
};

export type CareerContent = {
  release: {
    careerEpoch: string;
    verifiedAt: string;
    source: string;
    policy: string;
  };
  profile: {
    name: string;
    role: Localized;
    availability: Localized;
    claim: [Localized, Localized];
    intro: Localized;
    email: string;
    github: string;
    linkedin: string;
    nav: { href: string; label: Localized }[];
  };
  proof: { value: string; label: Localized }[];
  experience: Experience[];
  featured: Featured[];
  evidence: Evidence[];
  showcase: Showcase;
  skills: Skill[];
  lab: LabItem[];
  closing: {
    title: Localized;
    sub: Localized;
  };
};

export const content = careerManifest as CareerContent;

// Six observation modes: relative bill-cost heights from the Web-Agent study.
// Exact values are deliberately not invented; the public claim is the observed range.
export const costBars = { heights: [80, 84, 91, 82, 86, 79], hi: 3 };
