import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jiaming Wei — Research CV | Reliable Agent Evaluation",
  description:
    "Research CV for Jiaming Wei: Web / Computer-Use agent evaluation, evaluator reliability, red teaming, post-training attribution and reproducible research systems.",
  alternates: {
    canonical: "https://quarkspace.top/en/resume",
    languages: {
      "zh-CN": "https://quarkspace.top/resume",
      en: "https://quarkspace.top/en/resume",
    },
  },
};

export default function EnglishResumeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
