# Portfolio Rebuild — 2026-09-20

> Status: **CLOSED / RELEASED** · PRs #139–#143 · current `main@5ee08451a8e260b9e22c68332c49d4326b736802`  
> Initial base: `main@377d730c8b2cbddfa5e0c96b301afb610c4c5664`  
> Final release train: portfolio v2 → current printable resume → first-class showcase → repository handoff → real print-to-PDF contract. Historical CV binaries were retired rather than silently overwritten.

## Phase 0 — safety freeze

- [x] Branch created from current main.
- [x] Existing production surfaces identified: `/`, `/models`, `/persona`.
- [x] Repository contracts read: `AGENTS.md`, `CHECKPOINT.md`, `TODO.md`, `docs/UI.md`, `GOTCHAS.md`.
- [x] Personal-site edits kept away from observatory data files and `globals.css`.
- [x] EdgeOne merge-immediately-publishes behavior respected: changes stay on PR branch until CI + review.

## Phase 1 — public career truth audit

Upstream authorities inspected:

- JobFinder `CURRENT_PROFILE.md`, `POSITIONING_V2.md`, `WEAPON_INVENTORY.md`, interview dynamic claims and attachment registry.
- Career OS rebuild plan on `rebuild/career-os-20260920-plan`.
- Library reconciliation dated 2026-09-18 and 2026-09-20.
- Holistic AI dated final-deliverables evidence.
- Public dissertation/research repository and current quarkspace implementation.

### Material stale claims on current homepage

| Surface | Current deployed claim | Current adjudication |
|---|---|---|
| Hero intro | “目前在 Holistic AI 做 Research Intern” | stale: fixed-term internship ended 2026-09-18 |
| Hero figure | “2 个 2026 workshop submission” | stale/weak: REALM is accepted; submission count is no longer the right signal |
| Dissertation kicker/body | “REALM + NeurIPS VLM4RWD submitted” | stale: REALM accepted at EMNLP 2026 Workshop REALM; do not imply EMNLP main conference |
| Holistic experience | generic eval/red-team sentence | incomplete: misses delivered red-team measurement work and later LL144 audit-system work |
| Contact | `jimmyenglish@126.com` | stale for long-run identity; current professional contact is `jiaming.wei.ai@outlook.com` |
| Root language | Chinese only | incomplete: `/models` already supports zh/en, root does not |
| Research artifacts | GitHub/CV-heavy | incomplete: public research portfolio exists; poster/showcase evidence is absent from the site |
| Observatory card | hard-frozen exact counts | drift-prone: root should avoid manually copying live observatory counts |
| Experience placement | buried below projects | weak scan path: Holistic/UCL evidence should appear before the long project list |

### Public-safe current facts adopted for the rebuild

- Core identity remains **AI Evaluation · Red Teaming · Agent Reliability**.
- Research continuity: reliable agent evaluation for adaptive agentic systems.
- Holistic AI: Research Intern, London, 2026-06-18 → 2026-09-18, completed.
- Public-safe Holistic story: end-to-end red-team/evaluation measurement work; grader/judge and failure-mode auditing; later executable NYC Local Law 144 audit pipeline and final live delivery/demo. No customer identity, private repo names, credentials, private prompts or confidential data are exposed.
- REALM: **accepted at the EMNLP 2026 Workshop REALM**. Accepted ≠ published. Do not write “Accepted at EMNLP 2026”.
- VLM4RWD: keep conservative submitted wording until newer direct evidence lands.
- UCL × Holistic showcase: final poster presented 2026-09-16.
- Permanent professional contact: `jiaming.wei.ai@outlook.com`.
- The public site must not infer unresolved reference/employment-document states or expose private referee contact details.

## Target information architecture

1. Hero — identity, problem statement, current proof.
2. Experience — Holistic AI + UCL research before project catalogue.
3. Selected work — research/evaluation systems, evidence-first.
4. Research evidence — REALM, public portfolio, poster/showcase, dissertation/repo.
5. Measurement chain — retained as the unifying method.
6. Capability map — evaluation / agents / model / systems, tied to evidence.
7. Personal Lab — selected breadth only, not a second main identity.
8. Contact.

## Language contract

The original v2 implementation used one URL with client-side zh/en switching. Phase 10 superseded that contract.

Current contract:
- `/`, `/resume`, `/showcase` = Chinese domestic-job audience;
- `/en`, `/en/resume`, `/en/showcase` = English research / Fall-2027 PhD audience;
- each route pair reuses the same implementation and one public-safe manifest, but audience-specific ordering/copy is allowed;
- the URL is the authoritative language/audience selector for shareable portfolio links;
- `quarkspace-language` remains a compatibility/preference signal for other bilingual products such as `/models`, but it must not override a portfolio route;
- metadata/canonical/language alternates must map each Chinese route to its English counterpart;
- do not create separate career fact files for Chinese and English. `data/career-public.json` carries the shared facts plus `china-work` and `phd-research` projections.

The observatory logo remains a home link without changing the mobile rail geometry.

## Freshness contract

This rebuild introduces a public-safe manifest instead of scattering career facts through JSX.

`data/career-public.json` owns:
- career epoch;
- verified date;
- recruiter-facing public facts and links;
- bilingual homepage copy.

`app/home-content.ts` remains the implementation/type boundary that consumes the manifest.

A lightweight check validates the manifest and warns when verification is old. It must not hard-block unrelated daily observatory data refresh merely because the career profile is old.

## Artifact policy

- Existing CV PDFs are preserved; this rebuild does not silently rewrite historical binaries.
- Public four-page research portfolio can be linked from the public dissertation repo.
- Poster/showcase is surfaced as a first-class evidence item. The canonical poster binary currently lives outside this public repo; the site must not link recruiters to a private JobFinder URL.
- No confidential Holistic material is copied into this public repository.

## Acceptance gates

Phase 1:
- [x] all material homepage stale/conflict items have an adjudication;
- [x] accepted ≠ published boundary preserved;
- [x] public/private Holistic boundary preserved.

Phase 2–4:
- [x] root is fully bilingual;
- [x] current Holistic + REALM status rendered;
- [x] Experience moves above selected work;
- [x] portfolio/poster/showcase evidence surface exists;
- [x] root no longer hard-copies live Observatory counts;
- [x] `/models` has a home link and shares language preference;
- [x] lint/build/mobile/CI green (CI run 385, including 320/390/430 on both `/models` and `/`).

Phase 5:
- [x] PR diff reviewed;
- [x] no change to main until acceptance gates are green. Production merge remains a separate release action because EdgeOne deploys immediately.


## Phase 6 — current resume surface

- [x] retired the two stale August recruiter-facing PDF binaries from the public repository;
- [x] replaced homepage CV links with a bilingual `/resume` route backed by the same career manifest;
- [x] added print / Save-as-PDF behavior instead of pretending an old binary is current;
- [x] guarded against the retired filenames returning;
- [x] added `/resume` to mobile CI;
- [x] PR #140 green and merged; merge commit `117a36eb88e27935de797ed6fbd4b49387508ec9`.

The private JobFinder canonical PDF release remains a separate authority and must still pass its own renderer/preflight contract before being called current.

## Phase 7 — poster/showcase evidence surface

- [x] added bilingual `/showcase`;
- [x] reconstructed the final 16 Sep poster case study and six research findings from public-safe evidence;
- [x] linked the public 4-page research PDF, interactive research page, demo and repository;
- [x] routed the homepage Research Poster & Showcase evidence card to the first-party showcase surface;
- [x] removed hard-coded volatile publication-status copy from `/resume`; research status now resolves by stable manifest id;
- [x] added stable ids for experience/evidence entities and contract checks for them;
- [x] added per-route metadata and `/showcase` mobile CI;
- [x] PR #141 green and merged; merge commit `cd1e055d5c67abd7ecaddd42f23546c705574f68`.

### Remaining bounded item

The exact canonical final poster PDF still lives in the private evidence vault. The public site no longer depends on it for recruiter usefulness because `/showcase` reconstructs the public-safe evidence and links the public research artifacts. Mirroring that binary into this repository is optional convenience only and must wait for a deliberate binary upload path; never expose a private JobFinder raw URL.

## Phase 8 — repository handoff contract

- [x] AGENTS recognizes `/`, `/resume`, and `/showcase` as one recruiter-facing personal-site product;
- [x] route/mobile contract documents the four public probes `/models`, `/`, `/resume`, `/showcase`;
- [x] CHECKPOINT records the separation between the current public resume and the private JobFinder PDF release;
- [x] PR #142 merged before the final print contract.

## Phase 9 — real print-to-PDF contract

The initial `/resume` route offered “Print / Save PDF”, but the root layout also renders the ICP filing after every route. A browser print could therefore include the regulatory web footer as stray CV content or an extra page.

- [x] `app/site-beian.module.css` hides the filing strip only under `@media print`; the web filing remains present;
- [x] `scripts/check-resume-print.mjs` uses real Chrome print media rather than a CSS grep;
- [x] the print probe requires resume paper present, toolbar hidden, filing hidden and zero visible interactive buttons;
- [x] at Phase 9, CI ran that print probe after the then-current four mobile-route probes; Phase 10 extends both mobile and print coverage to the audience-split routes;
- [x] PR #143 CI run **401 green**;
- [x] PR #143 merged as `main@5ee08451a8e260b9e22c68332c49d4326b736802`;
- [x] post-merge main CI run **402 green**.

Observed print result on the green run:
- `filingDisplay: "none"`;
- `toolbarDisplay: "none"`;
- `visibleButtons: 0`;
- `resume print contract passed`.

## Phase 10 — route-level audience split + production regression gate

The owner clarified that the two languages have different primary readers: the Chinese surface is mainly for domestic job search, while the English surface is mainly for PhD / research evaluation. A client-side language toggle was therefore the wrong abstraction even though the copy itself was bilingual.

- [x] read the current QuarkSpace handoff/report docs before changing implementation;
- [x] re-grounded public-site positioning in JobFinder / Career OS current truths, including `CURRENT_PROFILE`, `POSITIONING_V2`, `CAREER_TRACKS`, `WEAPON_INVENTORY`, the Fall-2027 PhD target index, and the current English Research CV;
- [x] kept one evidence chain while introducing two audience projections: `china-work` and `phd-research`;
- [x] made `/` the Chinese work-facing portfolio and `/en` the English research/PhD portfolio;
- [x] bound the matching resumes to `/resume` and `/en/resume`;
- [x] mirrored the poster/showcase route at `/showcase` and `/en/showcase`;
- [x] replaced in-place portfolio language buttons with deterministic route navigation;
- [x] gave the English homepage an explicit Fall-2027 research direction: **Reliable Agent Evaluation for Adaptive Agentic Systems**;
- [x] reshaped the English CV around research/publications → education → research/engineering experience → research systems → methods/credentials instead of translating the Chinese recruiter CV line-for-line;
- [x] added current public-safe UCL supervisors, publication/review status, dissertation title and test credentials needed by the research surface;
- [x] kept REALM wording exact: accepted at **EMNLP 2026 Workshop REALM**, not EMNLP main conference and not published;
- [x] kept VLM4RWD at submitted / under review;
- [x] removed the drift-prone `Prof.` honorific from the public supervisor line and preserved only the supervisor relationship;
- [x] added locale-specific metadata, canonical URLs and language alternates;
- [x] expanded the career contract to guard audience route topology and research/publication status;
- [x] expanded PR/main CI to `/models` + all six portfolio routes at 320 / 390 / 430, and both resume print contracts;
- [x] added `.github/workflows/portfolio-production-smoke.yml`: relevant `main` pushes wait boundedly for EdgeOne, then probe the real domain rather than trusting deployment assumptions;
- [x] PR #145 final-head CI green and merged as `main@d2bb98cd74e51da4ebdeaa0177125fd19509e399`;
- [x] post-merge main CI run **35604912663** green;
- [x] production smoke run **35604912657** green.

Observed production smoke:
- EdgeOne initially returned 404 for the new English route during propagation, then exposed the current portfolio marker at **2026-09-21 13:21:29 UTC**;
- `/` contained the Chinese work marker `大模型评测`;
- `/en` contained `Reliable Agent Evaluation for Adaptive Agentic Systems`;
- both resume markers and both showcase titles were present;
- locale cross-links passed in both directions;
- all six production portfolio routes matched viewport width at 320 / 390 / 430;
- both production resume routes passed the real Chrome print contract.

The production smoke itself is now part of the release system. Do not recreate “open these pages by hand after deploy” as recurring release debt.

## Final acceptance state — 2026-09-21

The recruiter/research portfolio rebuild is **closed in production**.

Current topology:
- Chinese domestic-job audience: `/`, `/resume`, `/showcase`;
- English PhD/research audience: `/en`, `/en/resume`, `/en/showcase`;
- Observatory remains `/models`.

The six portfolio routes are not six truth stores. They render one public-safe Career OS projection with audience-specific ordering/copy. The Chinese site foregrounds completed Holistic delivery, evaluation/red-team/agent reliability evidence and a recruiter-facing CV. The English site foregrounds the research question, UCL/publication evidence, contribution/negative-result logic, next research direction and a research CV.

Release evidence is complete:
- PR #145 merged to `main@d2bb98c`;
- final-head PR CI green;
- post-merge main CI **35604912663** green;
- real EdgeOne production smoke **35604912657** green;
- six production portfolio routes passed route/content/cross-link checks and 320/390/430 Chrome probes;
- both production CVs passed real print-media checks.

Remaining work is deliberately bounded:
1. optional public-safe poster-PDF binary mirroring only;
2. future career changes flow Career OS → one public-safe manifest → audience projections;
3. production smoke remains automated and should be reused rather than replaced with manual acceptance prose.

The private JobFinder canonical CV/PDF release system remains separate authority; a web CV being current does not promote a private canonical PDF.

