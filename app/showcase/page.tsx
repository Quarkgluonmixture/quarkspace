"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { content, type Lang, type Localized } from "../home-content";
import s from "./showcase.module.css";

const LANGUAGE_KEY = "quarkspace-language";
const OLD_LANGUAGE_KEY = "observatory-language";
const tr = (value: Localized, lang: Lang) => value[lang];

export default function ShowcasePage() {
  const pathname = usePathname();
  const lang: Lang = pathname === "/en/showcase" || pathname.startsWith("/en/") ? "en" : "zh";
  const { showcase } = content;
  const audience = content.audiences[lang];

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    localStorage.setItem(LANGUAGE_KEY, lang);
    localStorage.setItem(OLD_LANGUAGE_KEY, lang);
  }, [lang]);

  return (
    <main className={s.page}>
      <header className={s.topbar}>
        <div className={s.topbarInner}>
          <Link href={audience.route} className={s.back}>← {lang === "zh" ? "Jiaming Wei 首页" : "Jiaming Wei research home"}</Link>
          <div className={s.lang} aria-label="Language">
            <Link href="/showcase" aria-current={lang === "zh" ? "page" : undefined} className={lang === "zh" ? s.active : ""}>中</Link>
            <Link href="/en/showcase" aria-current={lang === "en" ? "page" : undefined} className={lang === "en" ? s.active : ""}>EN</Link>
          </div>
        </div>
      </header>

      <div className={s.wrap}>
        <section className={s.hero}>
          <p className={s.eyebrow}>{tr(showcase.event, lang)}</p>
          <h1>{tr(showcase.posterTitle, lang)}</h1>
          <p className={s.dek}>{tr(showcase.posterSubtitle, lang)}</p>
          <p className={s.people}>{tr(showcase.people, lang)}</p>
          <div className={s.actions}>
            <a className={s.primary} href={showcase.publicArtifacts.posterPdf}>
              {lang === "zh" ? "海报 PDF（原版）↗" : "Poster PDF (as presented) ↗"}
            </a>
            <a href={showcase.publicArtifacts.portfolioPdf}>4-page Research Portfolio ↗</a>
            <a href={showcase.publicArtifacts.portfolioPage}>
              {lang === "zh" ? "交互式研究页 ↗" : "Interactive research page ↗"}
            </a>
            <a href={showcase.publicArtifacts.repo}>GitHub ↗</a>
          </div>
        </section>

        <figure className={s.posterFigure}>
          <a href={showcase.publicArtifacts.posterPdf} aria-label={lang === "zh" ? "打开海报 PDF" : "Open the poster PDF"}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static export; a plain preview image is enough */}
            <img
              src={showcase.publicArtifacts.posterPreview}
              alt={lang === "zh"
                ? "研究海报：When Is Expensive Perception Worth Paying For?"
                : "Research poster: When Is Expensive Perception Worth Paying For?"}
              width={1357}
              height={1921}
              loading="lazy"
            />
          </a>
          <figcaption>
            {lang === "zh"
              ? "2026-09-16 展示的原版海报。点击打开 PDF。"
              : "The poster as presented on 16 Sep 2026. Click to open the PDF."}
          </figcaption>
        </figure>

        <section className={s.poster}>
          <div className={s.posterHead}>
            <span>POSTER CASE STUDY</span>
            <strong>{lang === "zh" ? "同一任务，不同视图" : "Same task, different view"}</strong>
          </div>
          <p className={s.task}>{tr(showcase.example.task, lang)}</p>
          <div className={s.compare}>
            <article>
              <span>{showcase.example.read.label}</span>
              <b>{showcase.example.read.value}</b>
              <strong>{tr(showcase.example.read.outcome, lang)}</strong>
            </article>
            <article>
              <span>{showcase.example.look.label}</span>
              <b>{showcase.example.look.value}</b>
              <strong>{tr(showcase.example.look.outcome, lang)}</strong>
            </article>
          </div>
          <p className={s.note}>{tr(showcase.example.note, lang)}</p>
        </section>

        <section className={s.findings}>
          <div className={s.sectionHead}>
            <span>01</span>
            <h2>{lang === "zh" ? "Showcase 上真正想传达的六件事" : "The six claims the showcase was built around"}</h2>
          </div>
          <div className={s.findingGrid}>
            {showcase.findings.map((finding) => (
              <article key={finding.no}>
                <span>{finding.no}</span>
                <h3>{tr(finding.title, lang)}</h3>
                <p>{tr(finding.text, lang)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={s.artifacts}>
          <div className={s.sectionHead}>
            <span>02</span>
            <h2>{lang === "zh" ? "研究材料" : "Research artifacts"}</h2>
          </div>
          <div className={s.artifactGrid}>
            <article className={s.pdfCard}>
              <div>
                <span className={s.kicker}>4-PAGE RESEARCH PORTFOLIO</span>
                <h3>{lang === "zh" ? "比 dissertation 更适合招聘者快速读" : "A fast research read before the full dissertation"}</h3>
                <p>{lang === "zh"
                  ? "问题、实验设计、负结果、机制诊断和工程系统放在同一条视觉叙事里。"
                  : "The question, experimental design, negative result, mechanism diagnosis and engineering system in one visual narrative."}</p>
                <a href={showcase.publicArtifacts.portfolioPdf}>{lang === "zh" ? "打开 PDF ↗" : "Open PDF ↗"}</a>
              </div>
              <iframe
                title="Jiaming Wei research portfolio"
                src={showcase.publicArtifacts.portfolioPdf}
                loading="lazy"
              />
            </article>

            <article className={s.demoCard}>
              <span className={s.kicker}>WEB-AGENT DEMO</span>
              <h3>{lang === "zh" ? "让失败轨迹本身成为证据" : "Make the failure trajectory part of the evidence"}</h3>
              <p>{lang === "zh"
                ? "研究仓库保留公开 demo，用来展示 agent 怎样观察、行动、卡住和恢复，而不是只展示最终 success rate。"
                : "The public research repo keeps a demo of how the agent observes, acts, stalls and recovers instead of showing only an aggregate success rate."}</p>
              <video controls preload="metadata" playsInline src={showcase.publicArtifacts.demo}>
                {lang === "zh" ? "浏览器不支持视频播放。" : "Your browser does not support video playback."}
              </video>
              <a href={showcase.publicArtifacts.repo}>{lang === "zh" ? "研究仓库 ↗" : "Research repository ↗"}</a>
            </article>
          </div>
        </section>

        <section className={s.boundary}>
          <div>
            <span>03</span>
            <h2>{lang === "zh" ? "公开边界" : "Disclosure boundary"}</h2>
          </div>
          <p>{tr(showcase.disclosure, lang)}</p>
          <p className={s.meta}>
            {lang === "zh"
              ? "Showcase poster 已于 2026-09-16 展示，原版 PDF 见页首。这个网页重建公开研究证据，不把私有公司材料伪装成 portfolio asset。"
              : "The final poster was presented on 16 Sep 2026; the original PDF is linked at the top. This page reconstructs public research evidence without turning private company material into a portfolio asset."}
          </p>
        </section>
      </div>
    </main>
  );
}
