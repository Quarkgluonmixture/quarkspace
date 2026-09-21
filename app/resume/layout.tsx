import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jiaming Wei — 中文简历 | 大模型评测 · 红队 · Agent 可靠性",
  description:
    "魏佳铭的中文招聘简历：Holistic AI、Web / Computer-Use Agent 研究、大模型评测、红队与 judge/grader reliability。",
  alternates: {
    canonical: "https://quarkspace.top/resume",
    languages: {
      "zh-CN": "https://quarkspace.top/resume",
      en: "https://quarkspace.top/en/resume",
    },
  },
};

export default function ResumeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
