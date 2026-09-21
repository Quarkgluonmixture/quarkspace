import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jiaming Wei — Web-Agent Research Poster & Showcase",
  description:
    "Public-safe Web-Agent research showcase: final UCL × Holistic AI poster, six findings, research portfolio, demo and reproducible repository.",
  alternates: {
    canonical: "https://quarkspace.top/en/showcase",
    languages: {
      "zh-CN": "https://quarkspace.top/showcase",
      en: "https://quarkspace.top/en/showcase",
    },
  },
};

export default function EnglishShowcaseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
