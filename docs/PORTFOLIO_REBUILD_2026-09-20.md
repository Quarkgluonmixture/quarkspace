# Portfolio Rebuild — 2026-09-20

> Status: **closed on public site** · released through PRs #139, #140 and #141  
> Initial base: `main@377d730c8b2cbddfa5e0c96b301afb610c4c5664`  
> Final public release train: portfolio v2 → current printable resume → first-class showcase surface. Historical CV binaries were retired from the public site rather than silently overwritten.

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

- One structure, two copies: zh/en are fields on the same content objects, not two independently maintained pages.
- Root uses the same persisted preference key as `/models`: `quarkspace-language`.
- `/models` should migrate the old `observatory-language` value once for backwards compatibility.
- The observatory logo becomes a home link without changing the mobile rail geometry.

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

## Final acceptance state — 2026-09-21

The four recruiter/public routes `/models`, `/`, `/resume`, and `/showcase` share the same language preference, have dedicated current content contracts, and are exercised at 320 / 390 / 430 in CI. The public career projection is now post-Holistic, REALM-accepted, bilingual, poster/showcase-aware and protected against the stale August CV binaries that originally triggered this rebuild.
