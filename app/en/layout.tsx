import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jiaming Wei — Reliable Agent Evaluation & Adaptive Agentic Systems",
  description:
    "Research portfolio for Fall 2027 PhD applications: reliable agent evaluation, evaluator-aware adaptation, Web / Computer-Use agents, red teaming and reproducible evaluation systems.",
  alternates: {
    canonical: "https://quarkspace.top/en",
    languages: {
      "zh-CN": "https://quarkspace.top/",
      en: "https://quarkspace.top/en",
    },
  },
};

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
