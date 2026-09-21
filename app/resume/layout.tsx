import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jiaming Wei — Resume | AI Evaluation · Red Teaming · Agent Reliability",
  description:
    "Current bilingual recruiter-facing resume for Jiaming Wei: AI evaluation, red teaming, Web / Computer-Use agents, judge reliability and reproducible evaluation systems.",
};

export default function ResumeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
