"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import s from "./home.module.css";
import v from "./home-v2.module.css";
import {
  content,
  costBars,
  type Evidence,
  type Experience,
  type Featured,
  type LabItem,
  type Lang,
  type Localized,
  type Skill,
} from "./home-content";

const SHOT_W = 1700;
const SHOT_H = 1099;
const RESUME = "/resume";
const LANGUAGE_KEY = "quarkspace-language";
const OLD_LANGUAGE_KEY = "observatory-language";

const tr = (value: Localized, lang: Lang) => value[lang];

function CostChart({ cap, lang }: { cap?: Localized; lang: Lang }) {
  return (
    <div>
      <div className={s.costwrap}>
        <p className={s.lbl} style={{ marginBottom: 14 }}>
          {lang === "zh" ? "六种观测模式的账单成本 / episode" : "Billed cost across six observation modes / episode"}
        </p>
        <div className={s.yax}>
          <span>$0.08</span>
          <span>{lang === "zh" ? "classifieds 站点" : "Classifieds site"}</span>
        </div>
        <div className={s.cost}>
          {costBars.heights.map((height, index) => (
            <i
              key={index}
              className={index === costBars.hi ? s.hi : undefined}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className={s.costlbl}>
          <span>$0.064 — $0.073</span>
          <span>{lang === "zh" ? "六种模式几乎持平" : "six modes are close in cost"}</span>
        </div>
      </div>
      {cap && <p className={s.cap}>{tr(cap, lang)}</p>}
    </div>
  );
}

function ProjectBody({ project, lang }: { project: Featured; lang: Lang }) {
  return (
    <>
      <span className={s.lbl}>{tr(project.kicker, lang)}</span>
      <h2 className={`${s.h2} ${project.bigTitle ? s.h2big : ""}`} style={{ marginTop: 14 }}>
        {tr(project.title, lang)}
      </h2>
      <div className={s.who}>
        {project.who.map((item) => <span key={item.en}>{tr(item, lang)}</span>)}
      </div>
      {project.shot && (
        <>
          <span className={s.shot}>
            <Image
              src={project.shot.src}
              alt={tr(project.shot.alt, lang)}
              width={SHOT_W}
              height={SHOT_H}
              sizes="(max-width: 900px) 100vw, 50vw"
            />
          </span>
          <p className={s.cap}>{tr(project.shot.cap, lang)}</p>
        </>
      )}
      {project.pull && <p className={s.pull}>{tr(project.pull, lang)}</p>}
      <p className={s.lead} style={{ marginTop: project.shot || project.pull ? 14 : 0 }}>
        {tr(project.lead, lang)}
      </p>
      {project.points && (
        <ul className={s.points}>
          {project.points.map((item) => <li key={item.en}>{tr(item, lang)}</li>)}
        </ul>
      )}
      <p className={s.stack}>{project.stack}</p>
      <span className={s.go}>{project.goLabel ? tr(project.goLabel, lang) : "GitHub →"}</span>
    </>
  );
}

function ProjectCard({ project, lang }: { project: Featured; lang: Lang }) {
  const inner = project.wide ? (
    <div className={s.banner}>
      <div><ProjectBody project={project} lang={lang} /></div>
      <div>{project.chart === "cost" && <CostChart cap={project.cap} lang={lang} />}</div>
    </div>
  ) : (
    <ProjectBody project={project} lang={lang} />
  );
  const className = `${s.t} ${s[project.span]}`;

  return project.href.startsWith("/") ? (
    <Link className={className} href={project.href}>{inner}</Link>
  ) : (
    <a className={className} href={project.href} rel="noreferrer">{inner}</a>
  );
}

function Section({
  no,
  title,
  count,
  id,
}: {
  no: string;
  title: string;
  count: string;
  id?: string;
}) {
  return (
    <div className={s.c12} id={id}>
      <div className={s.sec}>
        <span className={s.no}>{no}</span>
        <h2 className={s.secTitle}>{title}</h2>
        <span className={s.rule} />
        <span className={s.cnt}>{count}</span>
      </div>
    </div>
  );
}

function ExperienceCard({ item, lang }: { item: Experience; lang: Lang }) {
  return (
    <article className={v.experienceCard}>
      <div className={v.experienceHead}>
        <h3>{item.org}</h3>
        <span>{tr(item.role, lang)}</span>
      </div>
      <p className={v.experienceLead}>{tr(item.lead, lang)}</p>
      {item.points.length > 0 && (
        <ul className={v.experiencePoints}>
          {item.points.map((point) => <li key={point.en}>{tr(point, lang)}</li>)}
        </ul>
      )}
      <div className={v.tagRow}>
        {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
      </div>
    </article>
  );
}

function EvidenceCard({ item, lang }: { item: Evidence; lang: Lang }) {
  return (
    <a className={v.evidenceCard} href={item.href} rel="noreferrer">
      <span className={v.evidenceStatus}>{tr(item.status, lang)}</span>
      <h3>{tr(item.title, lang)}</h3>
      <p>{tr(item.text, lang)}</p>
      <strong>{tr(item.action, lang)}</strong>
    </a>
  );
}

function SkillCard({ item, lang }: { item: Skill; lang: Lang }) {
  return (
    <div className={v.skillCard}>
      <span>{tr(item.k, lang)}</span>
      <p>{tr(item.v, lang)}</p>
    </div>
  );
}

function LabRow({ item, lang }: { item: LabItem; lang: Lang }) {
  return (
    <a href={item.href} rel="noreferrer">
      <span className={s.tt}>{item.name}</span>
      <span className={s.yy}>{item.year}</span>
      <span className={s.dd}>{tr(item.text, lang)}</span>
    </a>
  );
}

function MeasurementChain({ lang }: { lang: Lang }) {
  const steps = lang === "zh"
    ? [
        ["01", "Target / Agent", "模型真正做了什么？任务成功、拒答，还是已经越过边界？", "behavior · task success"],
        ["02", "Execution / Harness", "这个结果来自模型，还是 observation、tool、provider filter、scaffold 或环境？", "trajectory · environment"],
        ["03", "Judge / Grader", "负责打分的工具自己靠谱吗？rubric、阈值、shortcut 和 FP/FN 会不会改写结论？", "FP / FN · calibration"],
        ["04", "Gold / Evidence", "结论最终靠什么兜底？能否回到独立标签、统计检验、来源和可重放证据？", "labels · provenance"],
      ]
    : [
        ["01", "Target / Agent", "What did the model actually do: succeed, refuse, or cross the boundary?", "behavior · task success"],
        ["02", "Execution / Harness", "Did the model cause the result, or did observation, tools, provider filters, scaffolding or environment change it?", "trajectory · environment"],
        ["03", "Judge / Grader", "Can the evaluator itself be trusted? Rubrics, thresholds, shortcuts and FP/FN can change the conclusion.", "FP / FN · calibration"],
        ["04", "Gold / Evidence", "What ultimately anchors the claim: independent labels, statistical tests, provenance and replayable evidence?", "labels · provenance"],
      ];

  return (
    <div className={`${s.t} ${s.c12}`}>
      <span className={s.lbl}>{lang === "zh" ? "同一条方法论 / measurement chain" : "One method / measurement chain"}</span>
      <div className={v.chainTitle}>
        <h2 className={s.h2}>
          {lang === "zh" ? "一个分数出来之前，我先检查这四层" : "Before trusting a score, I check four layers"}
        </h2>
        <span className={s.stack}>model → system → judge → evidence</span>
      </div>
      <div className={v.chainGrid}>
        {steps.map(([no, title, body, foot], index) => (
          <div key={no} className={index === steps.length - 1 ? v.chainLast : v.chainStep}>
            <div className={v.chainNo}><span>{no}</span>{index < steps.length - 1 && <i>→</i>}</div>
            <h3>{title}</h3>
            <p>{body}</p>
            <small>{foot}</small>
          </div>
        ))}
      </div>
      <p className={s.cap} style={{ marginTop: 14 }}>
        {lang === "zh"
          ? "Web-Agent routing、Holistic、redteam-under-test、FinQA 和 Model Observatory 看起来是不同项目，但都在追问：这个结果究竟意味着什么，产生它的测量链到底能不能信？"
          : "Web-Agent routing, Holistic, redteam-under-test, FinQA and the Model Observatory look like different projects, but they ask the same question: what does this result mean, and can the measurement chain that produced it be trusted?"}
      </p>
    </div>
  );
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("zh");
  const { profile } = content;
  const email = `mailto:${profile.email}`;

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
    <div className={s.home}>
      <div className={s.bar}>
        <div className={s.barIn}>
          <a className={`${s.me} ${v.brandLink}`} href="#top">{profile.name}</a>
          <nav className={s.nav}>
            {profile.nav.map((item) => <a key={item.href} href={item.href}>{tr(item.label, lang)}</a>)}
            <Link className={s.sub} href="/persona">Persona Lab ↗</Link>
            <Link className={s.sub} href="/models">{lang === "zh" ? "观测台 ↗" : "Observatory ↗"}</Link>
          </nav>
          <div className={v.topActions}>
            <div className={v.langSwitch} aria-label="Language">
              <button className={lang === "zh" ? v.active : ""} onClick={() => changeLanguage("zh")} aria-pressed={lang === "zh"}>中</button>
              <button className={lang === "en" ? v.active : ""} onClick={() => changeLanguage("en")} aria-pressed={lang === "en"}>EN</button>
            </div>
            <a className={s.cv} href={RESUME}>
              {lang === "zh" ? "简历 / PDF" : "CV / PDF"}
            </a>
          </div>
        </div>
      </div>

      <div className={s.wrap} id="top">
        <div className={s.g}>
          <section className={`${s.t} ${s.c8}`}>
            <span className={s.avail}><i />{tr(profile.availability, lang)}</span>
            <h1 className={s.h1}>{profile.name}</h1>
            <p className={s.role}>{tr(profile.role, lang)}</p>
            <p className={s.say}>{tr(profile.claim[0], lang)}<br />{tr(profile.claim[1], lang)}</p>
            <p className={s.lead}>{tr(profile.intro, lang)}</p>
            <div className={s.cta}>
              <a className={`${s.btn} ${s.pri}`} href="#experience">
                {lang === "zh" ? "看经历与研究" : "Experience & research"}
              </a>
              <a className={s.btn} href="https://quarkgluonmixture.github.io/Cost-Aware-Routing-for-Web-Usage-Agents/portfolio/">
                Research Portfolio
              </a>
              <a className={s.btn} href={RESUME}>
                {lang === "zh" ? "简历 / PDF" : "CV / PDF"}
              </a>
              <a className={s.btn} href={profile.github}>GitHub</a>
              <a className={s.btn} href={email}>{lang === "zh" ? "邮箱" : "Email"}</a>
            </div>
          </section>

          <aside className={`${s.t} ${s.c4} ${s.ink}`}>
            <div className={s.figs}>
              {content.proof.map((item) => (
                <div key={item.value}>
                  <em />
                  <b className={v.proofValue}>{item.value}</b>
                  <span>{tr(item.label, lang)}</span>
                </div>
              ))}
            </div>
          </aside>

          <Section
            no="01"
            title={lang === "zh" ? "经历与研究" : "Experience & Research"}
            count={lang === "zh" ? "先看真实交付" : "proof before catalogue"}
            id="experience"
          />
          <div className={`${s.t} ${s.c12}`}>
            <div className={v.experienceGrid}>
              {content.experience.map((item) => <ExperienceCard key={item.org} item={item} lang={lang} />)}
            </div>
          </div>

          <Section
            no="02"
            title={lang === "zh" ? "研究与系统" : "Selected Work"}
            count={`${content.featured.length} ${lang === "zh" ? "项" : "projects"}`}
            id="work"
          />
          {content.featured.slice(0, 3).map((project) => <ProjectCard key={project.slot} project={project} lang={lang} />)}
          <MeasurementChain lang={lang} />
          {content.featured.slice(3).map((project) => <ProjectCard key={project.slot} project={project} lang={lang} />)}

          <Section
            no="03"
            title={lang === "zh" ? "研究证据" : "Research Evidence"}
            count={lang === "zh" ? "论文 · Portfolio · Poster · Repo" : "paper · portfolio · poster · repo"}
            id="evidence"
          />
          <div className={`${s.t} ${s.c12}`}>
            <div className={v.evidenceGrid}>
              {content.evidence.map((item) => <EvidenceCard key={item.title.en} item={item} lang={lang} />)}
            </div>
            <div className={v.releaseStamp}>
              <span>{content.release.careerEpoch}</span>
              <span>{lang === "zh" ? "公开事实核验" : "public facts verified"} · {content.release.verifiedAt}</span>
            </div>
          </div>

          <Section
            no="04"
            title={lang === "zh" ? "能力图" : "Capabilities"}
            count={lang === "zh" ? "能力必须有证据对得上" : "every claim needs evidence"}
            id="skills"
          />
          <div className={`${s.t} ${s.c12}`}>
            <div className={v.skillGrid}>
              {content.skills.map((item) => <SkillCard key={item.k.en} item={item} lang={lang} />)}
            </div>
          </div>

          <Section
            no="05"
            title="Personal Lab"
            count={lang === "zh" ? "选出的旁支项目" : "selected side work"}
            id="lab"
          />
          <div className={`${s.t} ${s.c12}`}>
            <div className={s.list}>
              {content.lab.map((item) => <LabRow key={item.name} item={item} lang={lang} />)}
            </div>
          </div>

          <section className={`${s.t} ${s.c12} ${s.ink} ${s.closing}`} id="contact">
            <div className={v.closingCopy}>
              <h2 className={s.h2} style={{ margin: "0 0 6px" }}>{tr(content.closing.title, lang)}</h2>
              <p className={s.closingSub}>{tr(content.closing.sub, lang)}</p>
            </div>
            <div className={s.cta} style={{ margin: 0 }}>
              <a className={`${s.btn} ${s.pri}`} href={RESUME}>
                {lang === "zh" ? "简历 / PDF" : "CV / PDF"}
              </a>
              <a className={s.btn} href={profile.linkedin}>LinkedIn ↗</a>
              <a className={s.btn} href={email}>{lang === "zh" ? "邮件联系" : "Email"}</a>
              <a className={s.btn} href={profile.github}>GitHub ↗</a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
