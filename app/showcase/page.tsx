"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { content, type Lang, type Localized } from "../home-content";
import s from "./showcase.module.css";

const LANGUAGE_KEY = "quarkspace-language";
const OLD_LANGUAGE_KEY = "observatory-language";
const tr = (value: Localized, lang: Lang) => value[lang];

export default function ShowcasePage() {
  const [lang, setLang] = useState<Lang>("zh");
  const { showcase } = content;

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
    <main className={s.page}>
      <header className={s.topbar}>
        <div className={s.topbarInner}>
          <Link href="/" className={s.back}>← {lang === "zh" ? "Jiaming Wei 首页" : "Jiaming Wei home"}</Link>
          <div className={s.lang} aria-label="Language">
            <button onClick={() => changeLanguage("zh")} aria-pressed={lang === "zh"} className={lang === "zh" ? s.active : ""}>中</button>
            <button onClick={() => changeLanguage("en")} aria-pressed={lang === "en"} className={lang === "en" ? s.active : ""}>EN</button>
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
            <a className={s.primary} href={showcase.publicArtifacts.portfolioPdf}>
              {lang === "zh" ? "4-page Research Portfolio ↗" : "4-page Research Portfolio ↗"}
            </a>
            <a href={showcase.publicArtifacts.portfolioPage}>
              {lang === "zh" ? "交互式研究页 ↗" : "Interactive research page ↗"}
            </a>
            <a href={showcase.publicArtifacts.repo}>GitHub ↗</a>
          </div>
        </section>

        <section className={s.poster}>
          <div className={s.posterHead}>
            <span>{lang === "zh" ? "POSTER CASE STUDY" : "POSTER CASE STUDY"}</span>
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
                <h3>{lang === "zh" ? "比 dissertation 更适合招聘者快速读" : "A recruiter-sized view of the dissertation"}</h3>
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
              ? "Showcase poster 已于 2026-09-16 展示。这个网页重建公开研究证据，不把私有公司材料伪装成 portfolio asset。"
              : "The final poster was presented on 16 Sep 2026. This page reconstructs the public research evidence without turning private company material into a portfolio asset."}
          </p>
        </section>
      </div>
    </main>
  );
}
