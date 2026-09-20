"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { content, type Lang, type Localized } from "../home-content";
import r from "./resume.module.css";

const LANGUAGE_KEY = "quarkspace-language";
const OLD_LANGUAGE_KEY = "observatory-language";
const tr = (value: Localized, lang: Lang) => value[lang];

export default function ResumePage() {
  const [lang, setLang] = useState<Lang>("zh");
  const { profile } = content;
  const holistic = content.experience[0];
  const ucl = content.experience[1];
  const xjtu = content.experience[2];
  const research = content.featured[0];
  const redteam = content.featured[1];

  useEffect(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY) ?? localStorage.getItem(OLD_LANGUAGE_KEY);
    const frame = requestAnimationFrame(() => {
      if (saved === "zh" || saved === "en") {
        setLang(saved);
        localStorage.setItem(LANGUAGE_KEY, saved);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  const changeLanguage = (next: Lang) => {
    setLang(next);
    localStorage.setItem(LANGUAGE_KEY, next);
  };

  return (
    <main className={r.shell}>
      <div className={r.toolbar}>
        <Link href="/" className={r.back}>← {lang === "zh" ? "主页" : "Home"}</Link>
        <div className={r.toolbarRight}>
          <div className={r.lang} aria-label="Language">
            <button onClick={() => changeLanguage("zh")} aria-pressed={lang === "zh"} className={lang === "zh" ? r.active : ""}>中</button>
            <button onClick={() => changeLanguage("en")} aria-pressed={lang === "en"} className={lang === "en" ? r.active : ""}>EN</button>
          </div>
          <button className={r.print} onClick={() => window.print()}>
            {lang === "zh" ? "打印 / 保存 PDF" : "Print / Save PDF"}
          </button>
        </div>
      </div>

      <article className={r.paper}>
        <header className={r.header}>
          <div>
            <p className={r.eyebrow}>RESEARCH ENGINEER · AI EVALUATION</p>
            <h1>{profile.name}</h1>
            <h2>{tr(profile.role, lang)}</h2>
          </div>
          <div className={r.contact}>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <a href="https://quarkspace.top">quarkspace.top</a>
            <a href={profile.github}>GitHub</a>
            <a href={profile.linkedin}>LinkedIn</a>
          </div>
        </header>

        <p className={r.summary}>
          {lang === "zh"
            ? "研究并构建可靠的 LLM / Agent 评测系统，重点是 Web / Computer-Use Agent、red teaming、judge/grader reliability、benchmark provenance 与可复现实验基础设施。核心问题是：一个分数或失败意味着什么，以及产生它的 measurement chain 能不能信。"
            : "I study and build reliable LLM and agent evaluation systems across Web / Computer-Use agents, red teaming, judge/grader reliability, benchmark provenance and reproducible research infrastructure. The recurring question is what a score or failure actually means, and whether the measurement chain that produced it can be trusted."}
        </p>

        <section>
          <div className={r.sectionHead}>
            <span>01</span><h3>{lang === "zh" ? "经历" : "Experience"}</h3>
          </div>
          <div className={r.item}>
            <div className={r.itemHead}>
              <h4>{holistic.org}</h4>
              <span>{tr(holistic.role, lang)}</span>
            </div>
            <ul>
              {holistic.points.map((point) => <li key={point.en}>{tr(point, lang)}</li>)}
            </ul>
          </div>
        </section>

        <section>
          <div className={r.sectionHead}>
            <span>02</span><h3>{lang === "zh" ? "研究与论文" : "Research & Publications"}</h3>
          </div>
          <div className={r.item}>
            <div className={r.itemHead}>
              <h4>{tr(research.title, lang)}</h4>
              <span>UCL MSc · 2026</span>
            </div>
            <p className={r.status}>
              {lang === "zh"
                ? "Accepted at EMNLP 2026 Workshop REALM · Submitted to NeurIPS 2026 Workshop VLM4RWD"
                : "Accepted at EMNLP 2026 Workshop REALM · Submitted to NeurIPS 2026 Workshop VLM4RWD"}
            </p>
            <ul>
              {research.points?.slice(0, 3).map((point) => <li key={point.en}>{tr(point, lang)}</li>)}
            </ul>
            <div className={r.links}>
              <a href="https://openreview.net/forum?id=EAplLx6gCD">OpenReview ↗</a>
              <a href="https://quarkgluonmixture.github.io/Cost-Aware-Routing-for-Web-Usage-Agents/portfolio/">Research Portfolio ↗</a>
              <a href={research.href}>Repository ↗</a>
            </div>
          </div>
        </section>

        <section>
          <div className={r.sectionHead}>
            <span>03</span><h3>{lang === "zh" ? "精选系统" : "Selected System"}</h3>
          </div>
          <div className={r.item}>
            <div className={r.itemHead}>
              <h4>{tr(redteam.title, lang)}</h4>
              <span>2026 · PUBLIC / APACHE-2.0</span>
            </div>
            <p>{tr(redteam.lead, lang)}</p>
            <ul>
              {redteam.points?.map((point) => <li key={point.en}>{tr(point, lang)}</li>)}
            </ul>
            <div className={r.links}><a href={redteam.href}>Repository ↗</a></div>
          </div>
        </section>

        <section>
          <div className={r.sectionHead}>
            <span>04</span><h3>{lang === "zh" ? "教育" : "Education"}</h3>
          </div>
          <div className={r.education}>
            <div>
              <h4>{ucl.org}</h4>
              <p>{tr(ucl.role, lang)}</p>
            </div>
            <div>
              <h4>{xjtu.org}</h4>
              <p>{tr(xjtu.role, lang)}</p>
            </div>
          </div>
        </section>

        <section>
          <div className={r.sectionHead}>
            <span>05</span><h3>{lang === "zh" ? "技能" : "Skills"}</h3>
          </div>
          <div className={r.skills}>
            {content.skills.map((skill) => (
              <div key={skill.k.en}>
                <strong>{tr(skill.k, lang)}</strong>
                <p>{tr(skill.v, lang)}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className={r.footer}>
          <span>{content.release.careerEpoch}</span>
          <span>{lang === "zh" ? "公开事实核验" : "public facts verified"} · {content.release.verifiedAt}</span>
          <span>{lang === "zh" ? "Accepted ≠ published；未公开公司/客户材料不进入此页。" : "Accepted ≠ published; confidential company/client material is excluded."}</span>
        </footer>
      </article>
    </main>
  );
}
