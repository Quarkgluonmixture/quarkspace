"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import t from "./site-theme.module.css";
import s from "./home.module.css";
import Detector, { type EventStats } from "./detector";
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
const LANGUAGE_KEY = "quarkspace-language";
const OLD_LANGUAGE_KEY = "observatory-language";

const tr = (value: Localized, lang: Lang) => value[lang];

// The four layers of the measurement chain. They label the detector rings in the hero and are
// spelled out in the chain band further down — one list, so the picture and the prose agree.
const RING_LABELS = ["01 TARGET", "02 HARNESS", "03 JUDGE", "04 EVIDENCE"] as const;

const CHAIN: Record<Lang, [string, string, string, string][]> = {
  zh: [
    ["01", "Target / Agent", "模型真正做了什么？任务成功、拒答，还是已经越过边界？", "behavior · task success"],
    ["02", "Execution / Harness", "这个结果来自模型，还是 observation、tool、provider filter、scaffold 或环境？", "trajectory · environment"],
    ["03", "Judge / Grader", "负责打分的工具自己靠谱吗？rubric、阈值、shortcut 和 FP/FN 会不会改写结论？", "FP / FN · calibration"],
    ["04", "Gold / Evidence", "结论最终靠什么兜底？能否回到独立标签、统计检验、来源和可重放证据？", "labels · provenance"],
  ],
  en: [
    ["01", "Target / Agent", "What did the model actually do: succeed, refuse, or cross the boundary?", "behavior · task success"],
    ["02", "Execution / Harness", "Did the model cause the result, or did observation, tools, provider filters, scaffolding or environment change it?", "trajectory · environment"],
    ["03", "Judge / Grader", "Can the evaluator itself be trusted? Rubrics, thresholds, shortcuts and FP/FN can change the conclusion.", "FP / FN · calibration"],
    ["04", "Gold / Evidence", "What ultimately anchors the claim: independent labels, statistical tests, provenance and replayable evidence?", "labels · provenance"],
  ],
};

// What else lives on this domain (docs/VISION.md: the site is a portal, not only a portfolio).
// These are routes, not career facts, so they live here rather than in the career manifest.
// ⚠ No counts: a number copied from a live product drifts (AGENTS.md).
type PortalItem = { name: string; href: string; tag: string; text: Localized; external?: boolean };
const PORTAL: PortalItem[] = [
  {
    name: "AI Model Observatory",
    href: "/models",
    tag: "LIVE",
    text: {
      zh: "每条 observation 都带来源的模型观测台；缺失就是 N/A，不是 0。",
      en: "A model observatory where every observation keeps its source. Missing evidence stays N/A, never zero.",
    },
  },
  {
    name: "Persona Lab",
    href: "/persona",
    tag: "ACCESS-GATED",
    text: {
      zh: "Persona 表征实验台：候选编译与直接探针。运行需要访问口令。",
      en: "A persona-representation bench: candidate compiler and direct probes. Running it needs an access token.",
    },
  },
  {
    name: "Presentation Lab",
    href: "/presentation",
    tag: "EXPLAINERS · 中文",
    text: {
      zh: "用交互和可视化把一个概念讲清楚。",
      en: "Interactive explainers that make one concept actually clear (in Chinese).",
    },
  },
];
const PLAYGROUND: PortalItem[] = [
  {
    name: "Ricochet Mech Arena",
    href: "/ricochet-mech-arena",
    tag: "PLAY",
    external: true,
    text: {
      zh: "靠反弹弹道取胜的机甲对决：直射永远打不中。",
      en: "A mech duel won with geometry: direct shots never land, banked ones do.",
    },
  },
  {
    name: "Strandbound · 弦缚",
    href: "/deepseek",
    tag: "PLAY · 中文",
    external: true,
    text: {
      zh: "太空歌剧 · 生物收集 RPG，浏览器里直接运行。",
      en: "A space-opera creature-collecting RPG that runs in the browser (in Chinese).",
    },
  },
];

function localizedHref(href: string, lang: Lang) {
  if (lang === "en" && href === "/showcase") return "/en/showcase";
  return href;
}

// The Q of quarkspace: a ring with a gap and a tail — the favicon, redrawn inline so it can
// take the colour of whatever it sits on.
function QMark() {
  return (
    <svg className={s.qmark} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="15.4" r="9.6" fill="none" stroke="currentColor" strokeWidth="3.4"
        strokeDasharray="53.5 6.8" transform="rotate(46 16 15.4)" />
      <path d="M17.6 17 L24 23.4" stroke="currentColor" strokeWidth="3.6" />
      <path d="M23.6 23 L26.6 26" className={s.qnib} strokeWidth="3.6" strokeLinecap="round" />
    </svg>
  );
}

function CostChart({ cap, lang }: { cap?: Localized; lang: Lang }) {
  return (
    <div className={s.costSide}>
      <div className={s.cost}>
        <p className={s.costTitle}>
          {lang === "zh" ? "六种观测模式的账单成本 / episode" : "Billed cost across six observation modes / episode"}
        </p>
        <div className={s.costAxis}>
          <span>$0.08</span>
          <span>{lang === "zh" ? "classifieds 站点" : "Classifieds site"}</span>
        </div>
        <div className={s.costBars}>
          {costBars.heights.map((height, index) => (
            <i
              key={index}
              className={index === costBars.hi ? s.costHi : undefined}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className={s.costFoot}>
          <span>$0.064 — $0.073</span>
          <span>{lang === "zh" ? "六种模式几乎持平" : "six modes are close in cost"}</span>
        </div>
      </div>
      {cap && <p className={s.cap}>{tr(cap, lang)}</p>}
    </div>
  );
}

function ProjectText({ project, lang }: { project: Featured; lang: Lang }) {
  return (
    <div className={s.cardText}>
      <div className={s.cardTop}>
        <span className={s.slot}>{project.slot}</span>
        <span className={s.kicker}>{tr(project.kicker, lang)}</span>
      </div>
      <h3 className={`${s.cardTitle} ${project.bigTitle ? s.cardTitleBig : ""}`}>
        {tr(project.title, lang)}
      </h3>
      <div className={s.chips}>
        {project.who.map((item) => <span key={item.en}>{tr(item, lang)}</span>)}
      </div>
      {project.pull && <p className={s.pull}>{tr(project.pull, lang)}</p>}
      <p className={s.lead}>{tr(project.lead, lang)}</p>
      {project.points && (
        <ul className={s.points}>
          {project.points.map((item) => <li key={item.en}>{tr(item, lang)}</li>)}
        </ul>
      )}
      <p className={s.stack}>{project.stack}</p>
      <span className={s.go}>{project.goLabel ? tr(project.goLabel, lang) : "GitHub →"}</span>
    </div>
  );
}

// The card's shape follows what the project has to show, not a column count: a chart makes a
// banner, a screenshot makes a split, and text alone takes half a row. (The manifest still
// carries `span` from the old 12-column bento; this page no longer reads it.)
function ProjectCard({ project, lang, flip }: { project: Featured; lang: Lang; flip?: boolean }) {
  const href = localizedHref(project.href, lang);
  const shape = project.chart || project.shot ? s.cardSplit : s.cardHalf;
  const className = `${s.card} ${shape} ${flip ? s.cardFlip : ""}`;
  const inner = (
    <>
      <ProjectText project={project} lang={lang} />
      {project.chart === "cost" && <CostChart cap={project.cap} lang={lang} />}
      {project.shot && (
        <div className={s.cardMedia}>
          <span className={s.shot}>
            <Image
              src={project.shot.src}
              alt={tr(project.shot.alt, lang)}
              width={SHOT_W}
              height={SHOT_H}
              sizes="(max-width: 980px) 100vw, 50vw"
            />
          </span>
          <p className={s.cap}>{tr(project.shot.cap, lang)}</p>
        </div>
      )}
    </>
  );

  return href.startsWith("/") ? (
    <Link className={className} href={href} data-reveal>{inner}</Link>
  ) : (
    <a className={className} href={href} rel="noreferrer" data-reveal>{inner}</a>
  );
}

function Section({ no, title, count, id }: { no: string; title: string; count: string; id?: string }) {
  return (
    <div className={s.sec} id={id} data-reveal>
      <span className={s.secNo}>{no}</span>
      <h2 className={s.secTitle}>{title}</h2>
      <span className={s.secCnt}>{count}</span>
    </div>
  );
}

function ExperienceRow({ item, lang }: { item: Experience; lang: Lang }) {
  return (
    <article className={s.exp} data-reveal>
      <div className={s.expMeta}>
        <h3>{item.org}</h3>
        <p>{tr(item.role, lang)}</p>
      </div>
      <div className={s.expBody}>
        <p className={s.expLead}>{tr(item.lead, lang)}</p>
        {item.points.length > 0 && (
          <ul className={s.points}>
            {item.points.map((point) => <li key={point.en}>{tr(point, lang)}</li>)}
          </ul>
        )}
        <div className={s.tags}>
          {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      </div>
    </article>
  );
}

function EvidenceCard({ item, lang }: { item: Evidence; lang: Lang }) {
  const href = localizedHref(item.href, lang);
  return (
    <a className={s.evi} href={href} rel="noreferrer" data-reveal>
      <span className={s.eviStatus}><i />{tr(item.status, lang)}</span>
      <h3>{tr(item.title, lang)}</h3>
      <p>{tr(item.text, lang)}</p>
      <strong>{tr(item.action, lang)}</strong>
    </a>
  );
}

function SkillRow({ item, lang }: { item: Skill; lang: Lang }) {
  return (
    <div className={s.skill} data-reveal>
      <h3>{tr(item.k, lang)}</h3>
      {/* The manifest stores one " · "-joined line; splitting is presentation only. */}
      <ul>
        {tr(item.v, lang).split(" · ").map((entry) => <li key={entry}>{entry}</li>)}
      </ul>
    </div>
  );
}

function LabRow({ item, lang }: { item: LabItem; lang: Lang }) {
  const body = (
    <>
      <span className={s.labName}>{item.name}</span>
      <span className={s.labText}>{tr(item.text, lang)}</span>
      <span className={s.labYear}>{item.year}{item.href ? " ↗" : ""}</span>
    </>
  );
  return item.href ? <a href={item.href} rel="noreferrer">{body}</a> : <div>{body}</div>;
}

function PortalTile({ item, lang }: { item: PortalItem; lang: Lang }) {
  const body = (
    <>
      <span className={s.portalTag}>{item.tag}</span>
      <strong>{item.name}</strong>
      <span className={s.portalText}>{tr(item.text, lang)}</span>
      <span className={s.portalPath}>{item.href} →</span>
    </>
  );
  // The two games are static files behind a redirect, not Next routes: a plain anchor, so the
  // router does not try to prefetch them.
  return item.external
    ? <a className={s.portalTile} href={item.href}>{body}</a>
    : <Link className={s.portalTile} href={item.href}>{body}</Link>;
}

function MeasurementChain({ lang }: { lang: Lang }) {
  const [focus, setFocus] = useState(-1);
  const steps = CHAIN[lang];

  return (
    <section className={s.chain}>
      <div className={s.chainIn}>
        <div className={s.chainViz}>
          <Detector placement="center" labels={RING_LABELS} focus={focus} onFocus={setFocus} />
        </div>
        <div className={s.chainCopy}>
          <span className={s.chainKicker}>
            {lang === "zh" ? "同一条方法论 / measurement chain" : "One method / measurement chain"}
          </span>
          <h2 className={s.chainTitle}>
            {lang === "zh" ? "一个分数出来之前，我先检查这四层" : "Before trusting a score, I check four layers"}
          </h2>
          <p className={s.chainFlow}>model → system → judge → evidence</p>
          <ol className={s.steps}>
            {steps.map(([no, title, body, foot], index) => (
              <li
                key={no}
                className={focus === index ? s.stepOn : undefined}
                onMouseEnter={() => setFocus(index)}
                onMouseLeave={() => setFocus(-1)}
              >
                <span className={s.stepNo}>{no}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <small>{foot}</small>
                </div>
              </li>
            ))}
          </ol>
          <p className={s.chainCap}>
            {lang === "zh"
              ? "Web-Agent routing、Holistic、redteam-under-test、FinQA 和 Model Observatory 看起来是不同项目，但都在追问：这个结果究竟意味着什么，产生它的测量链到底能不能信？"
              : "Web-Agent routing, Holistic, redteam-under-test, FinQA and the Model Observatory look like different projects, but they ask the same question: what does this result mean, and can the measurement chain that produced it be trusted?"}
          </p>
        </div>
      </div>
    </section>
  );
}

const pad = (value: number, width: number) => String(value).padStart(width, "0");

function Readout({ stats, lang }: { stats: EventStats | null; lang: Lang }) {
  // Empty until the first collision: the page is prerendered, and a number the server could
  // not have known would be a hydration mismatch.
  return (
    <p className={s.readout} aria-hidden="true">
      <b>EVT {stats ? pad(stats.id, 4) : "····"}</b>
      {stats && (lang === "zh" ? (
        <span>
          {stats.tracks} 条轨迹 → <em>{stats.evidence}</em> 条到达 evidence · {stats.judge} 条止于 judge · {stats.harness} 条止于 harness
        </span>
      ) : (
        <span>
          {stats.tracks} tracks → <em>{stats.evidence}</em> reached evidence · {stats.judge} stopped at judge · {stats.harness} at harness
        </span>
      ))}
      <i>{lang === "zh" ? "示意动画，不是实验数据 · 点击再对撞一次" : "Illustrative animation, not experimental data · click to collide again"}</i>
    </p>
  );
}

export default function Home() {
  const pathname = usePathname();
  const lang: Lang = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "zh";
  const { profile } = content;
  const audience = content.audiences[lang];
  const email = `mailto:${profile.email}`;
  const resume = audience.resumeRoute;
  const experiences = audience.experienceIds
    .map((id) => content.experience.find((item) => item.id === id))
    .filter((item): item is Experience => Boolean(item));
  const featured = audience.featuredSlots
    .map((slot) => content.featured.find((item) => item.slot === slot))
    .filter((item): item is Featured => Boolean(item));

  // Cards that carry a picture alternate which side it sits on.
  const splitOrder = featured.filter((item) => item.chart || item.shot).map((item) => item.slot);

  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    localStorage.setItem(LANGUAGE_KEY, lang);
    localStorage.setItem(OLD_LANGUAGE_KEY, lang);
  }, [lang]);

  useEffect(() => {
    const root = rootRef.current;
    const hero = heroRef.current;
    if (!root || !hero) return;

    // The bar is glass over the instrument and paper once the hero has scrolled away.
    const bar = new IntersectionObserver(([entry]) => setSolid(!entry.isIntersecting), {
      rootMargin: "-56px 0px 0px 0px",
    });
    bar.observe(hero);

    // Scroll-spy for the section links.
    const spy = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) setActive(`#${entry.target.id}`);
    }, { rootMargin: "-45% 0px -50% 0px" });
    for (const item of profile.nav) {
      const target = root.querySelector(item.href);
      if (target) spy.observe(target);
    }

    // Reveal on scroll. The hidden state only exists once data-js is set, so the prerendered
    // page — and any reader without JavaScript — sees everything.
    const reveal = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-in", "");
        reveal.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -8% 0px" });
    const targets = [...root.querySelectorAll("[data-reveal]")];
    const fold = window.innerHeight;
    for (const target of targets) {
      // Already on screen at mount: mark it now, so nothing visible blinks out and back.
      if (target.getBoundingClientRect().top < fold) target.setAttribute("data-in", "");
      else reveal.observe(target);
    }
    root.setAttribute("data-js", "");

    return () => {
      bar.disconnect();
      spy.disconnect();
      reveal.disconnect();
    };
  }, [profile.nav]);

  return (
    <div className={`${t.theme} ${s.home}`} data-lang={lang} ref={rootRef}>
      <div className={`${s.bar} ${solid ? s.barSolid : ""}`}>
        <div className={s.barIn}>
          <a className={s.brand} href="#top" aria-label="quarkspace">
            <QMark /><span>quarkspace</span>
          </a>
          <nav className={s.nav}>
            {profile.nav.map((item) => (
              <a key={item.href} href={item.href} className={active === item.href ? s.navOn : undefined}>
                {tr(item.label, lang)}
              </a>
            ))}
            <i className={s.navSep} />
            <Link className={s.navOut} href="/persona">Persona Lab ↗</Link>
            <Link className={s.navOut} href="/models">{lang === "zh" ? "观测台 ↗" : "Observatory ↗"}</Link>
          </nav>
          <div className={s.actions}>
            <div className={t.lang} aria-label="Language">
              <Link className={lang === "zh" ? t.on : ""} href="/" aria-current={lang === "zh" ? "page" : undefined}>中</Link>
              <Link className={lang === "en" ? t.on : ""} href="/en" aria-current={lang === "en" ? "page" : undefined}>EN</Link>
            </div>
            <Link className={s.cv} href={resume}>
              {lang === "zh" ? "简历 / PDF" : "CV / PDF"}
            </Link>
          </div>
        </div>
      </div>

      <section className={s.hero} id="top" ref={heroRef}>
        <Detector className={s.heroCanvas} placement="hero" labels={RING_LABELS} onEvent={setStats} />
        <div className={s.heroShade} />
        <div className={s.heroIn}>
          <div className={s.heroCopy}>
            <span className={s.avail}><i />{audience.profile.availability}</span>
            <h1 className={s.name}>{profile.name}</h1>
            <p className={s.role}>{audience.profile.role}</p>
            <p className={s.claim}>
              <span>{audience.profile.claim[0]}</span>
              <span>{audience.profile.claim[1]}</span>
            </p>
            <p className={s.intro}>{audience.profile.intro}</p>
            <div className={s.cta}>
              <a className={`${s.btn} ${s.pri}`} href="#experience">
                {lang === "zh" ? "看经历与研究" : "Research & experience"}
              </a>
              <a className={s.btn} href="https://quarkgluonmixture.github.io/Cost-Aware-Routing-for-Web-Usage-Agents/portfolio/">
                Research Portfolio
              </a>
              <Link className={s.btn} href={resume}>
                {lang === "zh" ? "中文简历 / PDF" : "Research CV / PDF"}
              </Link>
              <a className={s.btn} href={profile.github}>GitHub</a>
              <a className={s.btn} href={email}>{lang === "zh" ? "邮箱" : "Email"}</a>
            </div>
          </div>

          <div className={s.heroFoot}>
            <dl className={s.proof}>
              {content.proof.map((item) => (
                <div key={item.value}>
                  <dt>{item.value}</dt>
                  <dd>{tr(item.label, lang)}</dd>
                </div>
              ))}
            </dl>
            <Readout stats={stats} lang={lang} />
          </div>
        </div>
      </section>
      <div className={s.scale} aria-hidden="true" />

      <div className={s.wrap}>
        {audience.researchDirection && (
          <section className={s.direction} data-reveal>
            <span className={s.kicker}>{audience.researchDirection.label}</span>
            <h2>{audience.researchDirection.title}</h2>
            <p className={s.directionQ}>{audience.researchDirection.question}</p>
            <p className={s.lead}>{audience.researchDirection.text}</p>
            <p className={s.stack}>{audience.researchDirection.next}</p>
          </section>
        )}

        <Section
          no="01"
          title={audience.sections.experience}
          count={audience.sections.experienceCount}
          id="experience"
        />
        <div className={s.expList}>
          {experiences.map((item) => <ExperienceRow key={item.id} item={item} lang={lang} />)}
        </div>

        <Section
          no="02"
          title={audience.sections.work}
          count={`${featured.length} · ${audience.sections.workCount}`}
          id="work"
        />
        <div className={s.g}>
          {featured.map((project) => (
            <ProjectCard
              key={project.slot}
              project={project}
              lang={lang}
              flip={splitOrder.indexOf(project.slot) % 2 === 1}
            />
          ))}
        </div>
      </div>

      {/* After all five, because this is what the five have in common. */}
      <MeasurementChain lang={lang} />

      <div className={s.wrap}>
        <Section
          no="03"
          title={audience.sections.evidence}
          count={audience.sections.evidenceCount}
          id="evidence"
        />
        <div className={s.eviGrid}>
          {content.evidence.map((item) => <EvidenceCard key={item.id} item={item} lang={lang} />)}
        </div>
        <div className={s.stamp}>
          <span>{content.release.careerEpoch}</span>
          <span>{lang === "zh" ? "公开事实核验" : "public facts verified"} · {content.release.verifiedAt}</span>
        </div>

        <Section
          no="04"
          title={audience.sections.skills}
          count={audience.sections.skillsCount}
          id="skills"
        />
        <div className={s.skills}>
          {content.skills.map((item) => <SkillRow key={item.k.en} item={item} lang={lang} />)}
        </div>

        <Section
          no="05"
          title={audience.sections.lab}
          count={audience.sections.labCount}
          id="lab"
        />
        <div className={s.lab} data-reveal>
          {content.lab.map((item) => <LabRow key={item.name} item={item} lang={lang} />)}
        </div>

        <Section
          no="06"
          title={lang === "zh" ? "站内入口" : "On This Domain"}
          count="quarkspace.top"
          id="space"
        />
        <div className={s.portal} data-reveal>
          {PORTAL.map((item) => <PortalTile key={item.href} item={item} lang={lang} />)}
        </div>
        <div className={s.play} data-reveal>
          <span className={s.playLabel}>PLAYGROUND</span>
          {PLAYGROUND.map((item) => <PortalTile key={item.href} item={item} lang={lang} />)}
        </div>

        <section className={s.closing} id="contact" data-reveal>
          <div className={s.closingRings} aria-hidden="true" />
          <div className={s.closingCopy}>
            <h2>{audience.closing.title}</h2>
            <p>{audience.closing.sub}</p>
          </div>
          <div className={s.cta}>
            <Link className={`${s.btn} ${s.pri}`} href={resume}>
              {lang === "zh" ? "中文简历 / PDF" : "Research CV / PDF"}
            </Link>
            <a className={s.btn} href={profile.linkedin}>LinkedIn ↗</a>
            <a className={s.btn} href={email}>{lang === "zh" ? "邮件联系" : "Email"}</a>
            <a className={s.btn} href={profile.github}>GitHub ↗</a>
          </div>
        </section>
      </div>
    </div>
  );
}
