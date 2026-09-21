import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jiaming Wei — Research Poster & Showcase",
  description:
    "Public-safe research showcase for Jiaming Wei's Web-Agent representation-routing work, including the final poster case study, six findings, research portfolio and demo.",
};

export default function ShowcaseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
