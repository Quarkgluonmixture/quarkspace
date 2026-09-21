import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jiaming Wei — Web-Agent Research Poster & Showcase",
  description:
    "魏佳铭的公开 Web-Agent research showcase：UCL × Holistic AI final poster、六个研究结论、4-page portfolio 与 demo。",
  alternates: {
    canonical: "https://quarkspace.top/showcase",
    languages: {
      "zh-CN": "https://quarkspace.top/showcase",
      en: "https://quarkspace.top/en/showcase",
    },
  },
};

export default function ShowcaseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
