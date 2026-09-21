"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { content, type Lang } from "../home-content";
import r from "./resume.module.css";

const LANGUAGE_KEY = "quarkspace-language";
const OLD_LANGUAGE_KEY = "observatory-language";

function SectionHead({ no, title }: { no: string; title: string }) {
  return (
    <div className={r.sectionHead}>
      <span>{no}</span><h3>{title}</h3>
    </div>
  );
}

export default function ResumePage() {
  const pathname = usePathname();
  const lang: Lang = pathname === "/en/resume" || pathname.startsWith("/en/") ? "en" : "zh";
  const { profile, academic } = content;
  const audience = content.audiences[lang];
  const holistic = content.experience.find((item) => item.id === "holistic-ai")!;
  const ucl = content.experience.find((item) => item.id === "ucl")!;
  const xjtu = content.experience.find((item) => item.id === "xjtu")!;
  const realm = content.evidence.find((item) => item.id === "realm-2026")!;
  const research = content.featured.find((item) => item.slot === "01")!;
  const redteam = content.featured.find((item) => item.slot === "02")!;
  const finqa = content.featured.find((item) => item.slot === "04")!;

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    localStorage.setItem(LANGUAGE_KEY, lang);
    localStorage.setItem(OLD_LANGUAGE_KEY, lang);
  }, [lang]);

  const siteUrl = lang === "en" ? "https://quarkspace.top/en" : "https://quarkspace.top";
  const showcaseRoute = audience.showcaseRoute;

  return (
    <main className={r.shell}>
      <div className={r.toolbar}>
        <Link href={audience.route} className={r.back}>← {lang === "zh" ? "主页" : "Research home"}</Link>
        <div className={r.toolbarRight}>
          <div className={r.lang} aria-label="Language">
            <Link href="/resume" aria-current={lang === "zh" ? "page" : undefined} className={lang === "zh" ? r.active : ""}>中</Link>
            <Link href="/en/resume" aria-current={lang === "en" ? "page" : undefined} className={lang === "en" ? r.active : ""}>EN</Link>
          </div>
          <button className={r.print} onClick={() => window.print()}>
            {lang === "zh" ? "打印 / 保存 PDF" : "Print / Save PDF"}
          </button>
        </div>
      </div>

      <article className={r.paper}>
        <header className={r.header}>
          <div>
            <p className={r.eyebrow}>{audience.resume.eyebrow}</p>
            <h1>{profile.name}</h1>
            <h2>{audience.profile.role}</h2>
          </div>
          <div className={r.contact}>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <a href={siteUrl}>{lang === "en" ? "quarkspace.top/en" : "quarkspace.top"}</a>
            <a href={profile.github}>GitHub</a>
            <a href={profile.linkedin}>LinkedIn</a>
          </div>
        </header>

        <p className={r.summary}>{audience.resume.summary}</p>

        {lang === "en" ? (
          <>
            <section>
              <SectionHead no="01" title="Research & Publications" />
              <div className={r.item}>
                <div className={r.itemHead}>
                  <h4>{academic.publication.title}</h4>
                  <span>UCL MSc · 2026</span>
                </div>
                <p><strong>{academic.publication.authors}</strong></p>
                <p className={r.status}>{academic.publication.status}</p>
                <p>{academic.publication.secondaryStatus} · {academic.publication.preprint}</p>
                <ul>
                  {research.points?.slice(0, 4).map((point) => <li key={point.en}>{point.en}</li>)}
                </ul>
                <div className={r.links}>
                  <a href={realm.href}>OpenReview ↗</a>
                  <a href={content.showcase.publicArtifacts.portfolioPdf}>4-page Research Portfolio ↗</a>
                  <Link href={showcaseRoute}>Poster & Showcase →</Link>
                  <a href={research.href}>Repository ↗</a>
                </div>
              </div>
            </section>

            <section>
              <SectionHead no="02" title="Education" />
              <div className={r.item}>
                <div className={r.itemHead}>
                  <h4>University College London (UCL), Department of Computer Science</h4>
                  <span>{academic.ucl.dates}</span>
                </div>
                <p>{academic.ucl.programme}</p>
                <p>{academic.ucl.completion}</p>
                <p>{academic.ucl.supervisors}</p>
                <p><strong>MSc dissertation:</strong> <em>{academic.publication.dissertationTitle}</em></p>
              </div>
              <div className={r.item}>
                <div className={r.itemHead}>
                  <h4>Xi&apos;an Jiaotong University</h4>
                  <span>{academic.xjtu.dates}</span>
                </div>
                <p>{academic.xjtu.programme} · {academic.xjtu.result}</p>
              </div>
            </section>

            <section>
              <SectionHead no="03" title="Research / Engineering Experience" />
              <div className={r.item}>
                <div className={r.itemHead}>
                  <h4>{holistic.org}</h4>
                  <span>{holistic.role.en}</span>
                </div>
                <ul>
                  {holistic.points.map((point) => <li key={point.en}>{point.en}</li>)}
                </ul>
              </div>
            </section>

            <section>
              <SectionHead no="04" title="Selected Research Systems" />
              <div className={r.item}>
                <div className={r.itemHead}>
                  <h4>{redteam.title.en}</h4>
                  <span>PUBLIC · 2026</span>
                </div>
                <p>{redteam.lead.en}</p>
                <ul>
                  {redteam.points?.map((point) => <li key={point.en}>{point.en}</li>)}
                </ul>
                <div className={r.links}><a href={redteam.href}>Repository ↗</a></div>
              </div>
              <div className={r.item}>
                <div className={r.itemHead}>
                  <h4>{finqa.title.en}</h4>
                  <span>POST-TRAINING ATTRIBUTION · 2026</span>
                </div>
                <p>{finqa.lead.en}</p>
                <ul>
                  {finqa.points?.slice(0, 3).map((point) => <li key={point.en}>{point.en}</li>)}
                </ul>
                <div className={r.links}><a href={finqa.href}>Repository ↗</a></div>
              </div>
            </section>

            <section>
              <SectionHead no="05" title="Research Methods & Engineering" />
              <div className={r.skills}>
                {content.skills.map((skill) => (
                  <div key={skill.k.en}>
                    <strong>{skill.k.en}</strong>
                    <p>{skill.v.en}</p>
                  </div>
                ))}
              </div>
              <div className={r.item}>
                <p><strong>English / tests:</strong> {academic.credentials.toefl} · {academic.credentials.gre}</p>
              </div>
            </section>
          </>
        ) : (
          <>
            <section>
              <SectionHead no="01" title="经历" />
              <div className={r.item}>
                <div className={r.itemHead}>
                  <h4>{holistic.org}</h4>
                  <span>{holistic.role.zh}</span>
                </div>
                <ul>
                  {holistic.points.map((point) => <li key={point.en}>{point.zh}</li>)}
                </ul>
              </div>
            </section>

            <section>
              <SectionHead no="02" title="研究与论文" />
              <div className={r.item}>
                <div className={r.itemHead}>
                  <h4>{research.title.zh}</h4>
                  <span>UCL MSc · 2026</span>
                </div>
                <p className={r.status}>{realm.status.zh}</p>
                <ul>
                  {research.points?.slice(0, 3).map((point) => <li key={point.en}>{point.zh}</li>)}
                </ul>
                <div className={r.links}>
                  <a href={realm.href}>OpenReview ↗</a>
                  <a href={content.showcase.publicArtifacts.portfolioPdf}>Research Portfolio ↗</a>
                  <Link href={showcaseRoute}>Poster / Showcase →</Link>
                  <a href={research.href}>Repository ↗</a>
                </div>
              </div>
            </section>

            <section>
              <SectionHead no="03" title="精选系统" />
              <div className={r.item}>
                <div className={r.itemHead}>
                  <h4>{redteam.title.zh}</h4>
                  <span>2026 · PUBLIC / APACHE-2.0</span>
                </div>
                <p>{redteam.lead.zh}</p>
                <ul>
                  {redteam.points?.map((point) => <li key={point.en}>{point.zh}</li>)}
                </ul>
                <div className={r.links}><a href={redteam.href}>Repository ↗</a></div>
              </div>
            </section>

            <section>
              <SectionHead no="04" title="教育" />
              <div className={r.education}>
                <div>
                  <h4>{ucl.org}</h4>
                  <p>{ucl.role.zh}</p>
                </div>
                <div>
                  <h4>{xjtu.org}</h4>
                  <p>{xjtu.role.zh}</p>
                  <p>{academic.xjtu.result}</p>
                </div>
              </div>
            </section>

            <section>
              <SectionHead no="05" title="技能" />
              <div className={r.skills}>
                {content.skills.map((skill) => (
                  <div key={skill.k.en}>
                    <strong>{skill.k.zh}</strong>
                    <p>{skill.v.zh}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <footer className={r.footer}>
          <span>{content.release.careerEpoch}</span>
          <span>{lang === "zh" ? "公开事实核验" : "public facts verified"} · {content.release.verifiedAt}</span>
          <span>{lang === "zh" ? "Accepted ≠ published；未公开公司/客户材料不进入此页。" : "Accepted ≠ published; confidential company/client material is excluded."}</span>
        </footer>
      </article>
    </main>
  );
}
