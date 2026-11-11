# CHECKPOINT

## 2026-11-05 · 当前 QuarkSpace / Model Observatory 状态

**本节是当前交接快照，优先于下方 2026-09-21 / 2026-08-26 的历史状态与数字。** Git 分支和 HEAD 不在这里固定；动手前仍以 GitHub 当前 main、PR、Issue 和工作流为准。

### 个人站重设计（2026-11-11，未合并）

- 六条个人站路由整体换成 event-display 设计，在分支 `redesign/event-display-20261111` 上，**线上没变**。分支与 PR 状态现查 `gh pr list --head redesign/event-display-20261111`。
- 理由、范围和验证清单在 `LOG.md` 2026-11-11 的两条。`/models`、`/persona` 没动；owner 已裁决不加「站内入口」一节。
- 合并即由 EdgeOne 发布，合并前读 CI，合并后看 `portfolio-production-smoke`。

### 产品边界与 Vision

- 当前权威方向见 2026-10-31 更新的 docs/VISION.md：QuarkSpace 是个人网站、公开项目入口与授权个人服务入口组成的门户，不等同于单一模型观察站。
- 三个产品面保持隔离：个人网站（六条中英文受众路由）、/models（AI Model Observatory）、/persona（Persona Lab）。各自保留数据、权限和运行时边界；不得因托管在同一仓库而合并数据源或权限。
- VISION 已更新，本轮不改 VISION。

### Observatory 当前基线

- 最新可用的模型数据契约报告来自 PR #130 当前 head（该 PR 只改 AA 参数归档 batch-14，不改 observations 或 model-data）：29 个模型家族、76 个 benchmark、2,270 条 observation、1,448 / 2,204 个已填单元格（65.7%）；来源拆分为 benchmark 961、independent 1,082、vendor 227。下一次数据改动前仍应在最新 main 上重跑 npm run check:data，作为正式基线。
- 2026-11-04 的 Issue #7 自动报告确认生产站与 main 一致：29 models × 76 benchmarks、10 个 chunk、约 1,753 KB；三个 host/route 探针均检测到 ICP filing。部署不是当前阻塞项。
- scripts/fetchers/index.mjs 注册 18 个 fetcher。不要把“已注册”误写成“全部每日刷新”：各源的 versioning、触发方式和可读性不同；AA 参数刷新是按需触发，发布页采集也不是每日漂移任务。
- .github/workflows/upstream.yml 每日 06:00 UTC 执行来源漂移、collection gaps、发布探针、部署与价格检查。它把 integrity 与 availability 分开处理：冻结源改写已发布数字仍是 integrity failure；来源不可读则进入独立 availability issue，不应把两者混成一个故障。
- 当前模型目录的 50-cell 收录地板仍有效。上游已发布但证据不足的模型继续留在观察队列，不创建空目录记录，也不降低地板。

### 当前开放 PR：逐项处理，不批量合并

| PR | 当前内容与证据 | 决策 / 下一步 |
| --- | --- | --- |
| #130 | AA 参数 batch-14 更新到 intelligence index v5，retrievedDate 为 2026-11-04。PR body 的检查输出报告 31 项 catalog/archive 差异：22 项 speed/latency，另有 9 项 intelligence / costTask 冲突。 | HOLD。窄 reconciler 只允许 speed / latency，遇到非机械字段会整批拒绝；目前没有写回 model-data。GitHub run 41837723030 是 action_required 且没有 job 执行，不是 CI 绿灯。PR body 中的本地检查显示 check:models FAILED；不能合并来掩盖矛盾。 |
| #151 | LiveBench 在 2026-09-29 曾从冻结版 2026-06-25 撤下 union-alpha 的 23 行，0 个分数变化。PR 提议在 withdrawnRows 中明确承认撤回；该模型没有目录 alias，相关行不进入已发布观察。CI 成功，但 tier-B 的 exemption 条件不通过（withdrawnRows 由 1 增至 2）。 | HOLD，等待 owner ruling。Issue #150 于 2026-10-19 自动关闭，但同日正是 Issue #159 记录 LiveBench 开始 404 的日期；不能把 #150 关闭解释为 union-alpha 已恢复或撤回问题已解决。先恢复可读性并复核，再决定是否接受这次撤回。 |
| #152 | Claude Opus 5.5 发布表归档 8 行：terminal-40 66.4（xhigh）与 hle-tools 67.7（max）两行可作为未来候选；另外 6 行仅留作 note。竞品列被拒绝，GDPval-AA 不重复归档，价格只记在 meta。CI 成功。 | HOLD，保留证据但不创建 Opus 5.5 目录记录：目前只有 2 个可 carry 单元，远低于 50-cell floor。PR 自身也明确没有满足可自动合并条件，需审阅该 archive-only 边界。 |
| #158 | /guide 对 Safari 站点级定位拒绝给出正确提示，并恢复重试入口；2 个文件，20 additions / 4 deletions。CI 成功。 | 与 Observatory 数据链无关，独立 UI 修复；不要把它和前三个数据 PR 捆绑处理。 |
| #162 | 恢复 LMArena / LiveBench / Vals 三个 reader；LMArena 改到 `/leaderboard/chat/text`，LiveBench 读官方 GitHub Pages repo 的 release assets，Vals Web Search 读取页面的 ParetoCurve island。离线测试和真实 CI run `41874872601` 在精确 head `927e6ed2cce0eeece4783aaf44d289b8ab308ce2` 通过。 | Draft。无 live source request；需要在真实 scheduled refresh 中验证，不能用 mock CI 关闭 #159。 |
| #163 | Vals Web Search fail-closed：整体/finance/legal 必须覆盖同一模型集合且 accuracy 是 finite number；Web Search 从 index 消失时整批失败。Reader tests 10/10，Actions run `42001495173` 在 head `f68058beec0ab918638bba2a08d0f6c4cbfaf0c8` 通过。 | Draft，stacked on #162。仍需真实 scheduled refresh；不要单独合并或将其解释为 Vals availability 已恢复。 |
| #164 | LiveBench optional cost CSV 只允许 404 视为缺失；403/429/5xx/network/HTML 都应 fail closed。新增 5 个 synthetic failure cases。 | Draft，stacked on #163；尚无 CI receipt，不能合并。 |

**#130 的 9 项非机械矛盾（catalog → archive）：**

- gpt-5.6-terra / max：intelligence 56.6 → 32.3；costTask 0.526 → 3.7349。
- qwen3.8-max / default：intelligence 58.1 → 33.7；costTask 0.9133 → 10.0239。
- minimax-m3 / default：intelligence 45.4 → 18.9；costTask 0.14 → 1.2851。
- inkling / xhigh：intelligence 42.3 → 12.5。
- inkling-small / default：intelligence 41.2 → 12.9；costTask 0.07 → 0.2032。

这些字段不是 AA 的 speed / latency 例行重测，不能由自动 reconciler 决定。先核对参数定义、单位、配置和归档证据，再决定哪一侧需要修正。不得手改 archive 行去迎合 catalog。

### 未解决的数据源：Issue #159

截至 2026-11-05 最新一次报告（Actions run `42036963313`），四个来源仍不可读：

| Source | 首次不可读 | 连续失败 | 本次原因 |
| --- | --- | ---: | --- |
| Artificial Analysis benchmark evaluations | 2026-11-05 | 1 | 410 Gone：`/api/v2/data/llms/models` |
| LMArena human preference Elo | 2026-10-13 | 24 | 403 Forbidden：`arena.ai/leaderboard/text` |
| LiveBench | 2026-10-19 | 18 | 404 Not Found：旧 `livebench.ai/categories_2026_06_25.json` |
| Vals AI | 2026-10-03 | 34 | 当前页面没有旧 reader 所要求的 finance task；#162/#163 改为从 Web Search 页面数据 island 读取并做覆盖校验。 |

#162/#163 的离线 reader tests 与 CI 证明的是新解析逻辑对 fixture 的行为，不证明真实上游可读；#164 只修复 cost 404 optionality。**在真实 scheduled refresh 成功前，#159 保持 OPEN，不能宣称三源恢复。**

- 每个 fetcher 独立执行，单源失败不应阻断其他来源的采集。
- availability issue 在首次不可读时创建；连续两次不可读才触发微信通知。来源恢复后由自动化清理 issue。
- 不手工重抄、不删除归档、不把 availability 当作 integrity。修复时分别处理权限/访问（LMArena）、数据文件路径或 release 结构（LiveBench）、task/schema 契约（Vals AI）。
- Issue #150（LiveBench integrity）已于 2026-10-19 关闭；由于该日同时开始 LiveBench availability 失败，关闭只说明 integrity issue 被清理，不能证明源已恢复。

### Collection gaps 与维护闭环

- Issue #7 于 2026-11-04 更新，当前报告 71 个 gap 项目；24 个上游文本模型尚未进入目录，均未达到 50-cell floor（7 个已有部分证据、17 个暂无归档证据）。这不是要求立即添加 24 条模型记录。
- 归档中约 6,600 行、来自 1,625 个发布模型字符串，等待目录模型或 alias；大量属于历史代际，不能把它们等同于当前可收录模型。
- 同一报告列出多项来源超过 30 天未读，包括人工发布表与部分本应由脚本重读的来源；逐源区分“手工源缺少新采集”“脚本刷新未发生”“来源不可读”，不要用一个 stale 标签代替诊断。
- 当前有一个 live-price lookup 仍指向已不存在的 qwen/qwen3.6-max-preview（目录键 qwen3.6-max）；应单独修复 provider id，不要混入 benchmark archive。
- Issue #7 的 heartbeat 显示：最近 3.9 天只有自动化 Bot 修改 main；scheduled-agent 作者身份的最近一次 commit 已过去 37.1 天。它不能单独证明 Agent 停机（也可能是队列全部阻塞），但维护闭环的执行端尚未得到活性证明。下一步需检查调度器实际运行、队列阻塞原因与 agent-authored commit 证据。
- Issue #7 同时报告 126 条 release posts、17 条 launch-like signals。发布探针有发现，不等于这些模型已满足收录门槛。

### 文档一致性与接手顺序

- CHECKPOINT 旧段落的 2026-09-21 个人站状态和 2026-08-26 Observatory 数字现已是历史快照；下文已标记为历史，冲突时以本节为准。
- TODO.md 仍有大量 2026-08 至 2026-09 的旧任务，不能直接当作当前执行队列。例如 Issue #122 已于 2026-09-05 自动关闭；integrity / availability 分流已于 2026-09-04 实施；手工 production smoke 已被 2026-09-21 加入的 portfolio-production-smoke workflow 取代。TODO 需要逐条对照当前代码、Issue、PR 和 LOG 再清理；未复核条目不自动视为仍待办。
- README.md 的来源数和观测统计也落后：README 仍写 16 个 scripted sources、2,224 observations / 1,405 of 2,117 cells / 66.4%；当前 fetcher registry 有 18 个 fetcher，最新可用契约报告为 2,270 observations / 1,448 of 2,204 cells / 65.7%。README 尚未在本次变更中改动。
- 接手顺序：①恢复并分别验证 #159 三个来源；②拆解 #130 的 9 项语义矛盾，再处理可机械 reconciliate 的 speed / latency；③在 LiveBench 恢复可读后复核 #151 并取得 owner ruling；④审阅 #152 的 archive-only 边界；⑤诊断 scheduled agent 活性与 #7 队列；⑥单独清理 TODO / README。
- 本次 checkpoint 更新不修改观测归档、model-data、alias、fetcher 或任何 PR 状态；不合并 #130 / #151 / #152 / #158。

---


## Historical snapshot · 2026-09-21 — recruiter-facing portfolio release (last verified 2026-09-21)

The rebuild that started on 2026-09-20 is closed on production at `main@d2bb98cd74e51da4ebdeaa0177125fd19509e399` (PR #145).

Recruiter-facing surfaces are now **route-level audience projections**, not one bilingual page with client-side copy switching:
- `/` — Chinese domestic-job portfolio;
- `/resume` — Chinese recruiter-facing printable CV;
- `/showcase` — Chinese poster / research-evidence case study;
- `/en` — English research / Fall-2027 PhD portfolio;
- `/en/resume` — English research CV;
- `/en/showcase` — English poster / research-evidence case study;
- `/models` — Observatory; separate product, still bilingual in-place.

The six portfolio routes share one public-safe fact layer in `data/career-public.json`. The manifest now carries two audience projections:
`zh = china-work` and `en = phd-research`. Work and PhD are **two readings of one evidence chain**, not two independently maintained identities. `app/home-content.ts` is only the typed boundary; do not fork career facts into route JSX.

Release train:
- PR #139 — evidence-first portfolio / current career projection;
- PR #140 — retire stale public CV binaries + printable web CV;
- PR #141 — first-class poster/showcase evidence;
- PR #142 — handoff docs for the first route topology;
- PR #143 — real print-to-PDF contract;
- PR #145 — route-level Chinese work / English research split, audience-specific CVs, locale metadata, expanded CI, and automatic production smoke; merge = `d2bb98c`.

Current public career projection:
- epoch = `2026-09-20-post-holistic`, re-verified 2026-09-21;
- Holistic AI fixed-term research internship completed 2026-09-18;
- UCL Web-Agent paper = **accepted at EMNLP 2026 Workshop REALM**; accepted ≠ published and ≠ EMNLP main conference;
- VLM4RWD = submitted / under review (as of 2026-09-21; superseded — accepted as a poster 2026-09-30, public manifest updated 2026-11-11);
- UCL × Holistic final poster/showcase = 2026-09-16;
- English research surface uses the current positioning **Reliable Agent Evaluation & Adaptive Agentic Systems**;
- private employer/customer material remains excluded.

Validation is closed at two levels:
- PR #145 final-head CI green: career contract, lint, full build, prerender/ICP, server-bundle render, real Chrome mobile probes and both resume print contracts;
- post-merge main CI run **35604912663** green;
- automatic production workflow run **35604912657** green against `https://quarkspace.top`;
- production markers verified on `/`, `/en`, `/resume`, `/en/resume`, `/showcase`, `/en/showcase`;
- all six portfolio routes passed real Chrome at 320 / 390 / 430 px;
- both `/resume` and `/en/resume` passed the real print-media contract;
- production locale cross-links were asserted in both directions.

`.github/workflows/portfolio-production-smoke.yml` now runs automatically after relevant `main` pushes. It waits boundedly for EdgeOne to expose the new portfolio markers, then tests the real domain. Production smoke is therefore a regression gate, not a hand-maintained checklist.

⛔ Public web-resume readiness does **not** promote the private JobFinder canonical PDF releases. They retain their own renderer/preflight/release authority.  
⛔ The exact canonical final poster PDF still lives in the private evidence vault. The public `/showcase` and `/en/showcase` surfaces are already recruiter/research complete; binary mirroring is optional only.  
⛔ The ICP filing remains a web-wide regulatory surface but is intentionally hidden under print media on both resume routes.  
⛔ Do not re-collapse `/` and `/en` into localStorage-only language switching: the URL itself now carries audience/language intent, so a shared recruiter/supervisor link is deterministic.

### Remaining bounded portfolio work

1. Optional only: deliberately mirror the canonical public-safe final poster PDF into this public repo if a supported binary upload path is available.
2. Any future career-status change must update upstream Career OS first, then the single public-safe manifest and its audience projections; do not hand-edit route JSX as a second truth source.
3. If a future portfolio deployment changes route content/layout, trust the automatic production-smoke workflow rather than adding a new manual smoke TODO.

**接手点** — 2026-09-04:**「每周合一次 AA 的 PR」这件事没了。** owner 的原话是「我总得手动合 PR,
我不想看,我就想让他更新」,所以这一轮拆的是**重复劳动**,不是判断:

- `auto/refresh-aa` 现在自己对账、自己合。`scripts/reconcile-aa.mjs` 只把重测过的
  **`speed` / `latency`** 抄进目录记录(这两个字段「归档是新的、目录是旧的」**按构造为真**),
  其余字段一律拒绝,**一条不合就整个不写**。四条件全绿才自合 —— 契约绿 · 零升级 ·
  零观测格移动 · 没人在这条 PR 上动过手。
- `docs/AGENT-OPERATIONS.md` 的 tier-B 从「**可以**自合」改成「**就该**自合」。旧措辞被
  hermes 读成「默认开 PR」(#109 的 body 自己这么写的),于是三条 CI 全绿的 PR 开了 10 天。
- ⛔ **别把 reconciler 当成「碰 `model-data.ts` 就要人」这条规矩被推翻了**:它是一个**窄例外**,
  两个参数位、只在已存在的记录上、只抄归档已发布的值。要放宽它是一次决定,不是维护性修改。

**同日第二轮**(体检 31 天之后补的两个洞):**可用性有了自己的收件人** ——
源读不出来不再借 drift job 的颜色,`source-availability` issue 首次就开(记录)、
微信**连续两次**才推(报警);drift 的判决改成从 log 决定,**未知的非零仍然红**。
**agent 的 liveness 变成可测** —— 章程加《Commit as yourself》,`check:heartbeat --agent`
多打一行 agent 署名的 commit 距今多久(只报不失败,身份在本仓库看不见的机器上)。
→ 坑 **52 / 53**,数字与复算在 `LOG.md` 2026-09-04 第二条。

⭐⭐ **体检的真正结论:新模型不会自动进目录,而这不是 bug。** 闸门每天跑、
**一次都没触发过**(`auto/new-model` 零 PR;上次加模型 = 2026-08-06 人工)。地板 = 现有模型
平均格数 = **49**,今天最好的候选 `grok-4.6` 只有 31 格 ⇒ 结构性够不到。⛔ 别去放开地板
(8-12 已判,会自我强化地塌)。⭐ 但**记录一旦存在,后面全自动**:归属闸门挂 alias、ingest 挂新行、
排行与雷达图纯派生(某轴凑够该轴 core 的 50%、最少 2 格就出数,`portfolioFloor`),
**没有第二个开关**。出路是 `TODO.md` 里那条「最新发布」看板。

**同日收尾**:三条积压的 PR 全部落地(#105 / #109 死路 verdict 入 §9;**#108 = CAIS HLE**,
出题方自己的板按规则 3 取代 AA 镜像当 primary,**实测移动 15 个已发布数字 + 16 格证据等级**,
覆盖率不变 67.1%、benchmark 源 932→948,详情 `LOG.md`)。⇒ **开着的 PR 清零。**
⭐ #108 是 tier-B 条件 2 的**唯一一次真实触发** —— 它自己在 body 里点名了是哪一条不满足
⇒ **闸门形状是对的,坏的只是措辞。**

⭐⭐ **同日 owner 裁决三道题,全部封口**(理由 → `LOG.md` 2026-09-04 最后一条):
**「最新发布」看板不做**(连带:**新模型进不了目录就是最终状态**,⛔ 别再当 bug 报上来)·
**hermes 死了不推微信**(读数已补上,问得到但不会主动找你)· **issue #122 已做完,不再红**。
⇒ `TODO.md` 顶部**从此没有「要你定」**,只剩三条要在真跑里看一眼的观察项。

⭐ #122 长出了**第四个 hatch `restatedRows`**:把**两端值都钉死**的窄赦免 —— 赦免的是
「这个归档值 → 那个上游值」**这一次**,不是这一格;同格再动到第三个值照样红。
⛔⛔ **别用 `versioning: "live"` 解这类问题**:那会让整个源的完整性检查消失(LiveBench 是 24 列),
为一格换掉一源。⚠ 两个 hatch 对行的处置**相反**(`withdrawnRows` 保留行,`restatedRows` 替换行)。
全文 → 坑 **54**。

⛔⛔ 仓库 2026-08-26 已改名 `ai-model-observatory` → `quarkspace`;**永远不要再建旧名的仓库**,
`…-lhi0hg2y.edgeone.cool` 是 EdgeOne 项目名派生的域名、**不许顺手替换**。全文 → 坑 **49**。

⚠ **文案的权威是三层,别压平成一句 "source of truth"**:职业事实/定位 → `JobFinder/00_总控/` ·
公开站的 public-safe facts + audience projections → `data/career-public.json`（`app/home-content.ts` 只做 typed boundary）·
历史设计快照 → quark-space(已 archived,只读,⛔ 不得回灌)。指反过三天且零告警(**30 个 npm script 没有一个校验散文**)—— 全文 `LOG.md` 2026-08-26。

⛔ **已定、别重新论证的两条**:**preview 规矩** —— 一条记录 = 一个在服役的版本,preview 的行留档不入库
(Qwen / Gemini 那两条上游精确同名且族里无 GA 取代 ⇒ 按坑 **25** 不动);**收录地板不放开** ——
会自我强化地塌,四档实测在 `LOG-archive` 2026-08-12 条(复算 = `npm run propose:model` 头几行)。

⇒ **要你定的都在 `TODO.md`**,标 ⭐ 的就是(**这里不维护第二份清单**,复算 =
`grep -n '⭐ \*\*要你定\|⭐ 要你定' TODO.md`)。

⚠⚠ **「契约全绿」只覆盖检查够得到的东西**:判一个数有没有被守住,**grep 哪条检查真的够得到它**。
⚠ `npm run test:sites` 本机要 GNU `timeout`(macOS 没有,exit 69)—— 别把 exit 69 当通过。

Snapshot for the next session. One page. 现场状态在这里;**动手前的自查在 `GOTCHAS.md`**;
历史在 `LOG.md`;未来在 `TODO.md`。都不能替代 `AGENTS.md`——它是操作合同,改任何东西之前先读它。

---

## Historical Observatory baseline · 2026-08-26 (superseded by 2026-11-04 snapshot above)

| | |
|---|---|
| 目录 | 29 model families · **72** benchmarks |
| 观测 | **2221 rows · 1402 / 2088 cells（67.1% cell coverage）** —— 2026-09-04 实测（8-26 是 2160 / 1391 / 66.6%），复算 = `npm run check:data` 末行 |
| 源分类 | benchmark **948** / independent 1054 / vendor 219（2026-09-04 实测；benchmark 那一格 +16 全部来自 CAIS HLE batch-38）|
| 溯源 | **319 / 322**（99%；3 格有值无据 = `deepseek-v4-flash` 两格 + `deepseek-v4-pro` 的 `open`，都在 `TODO.md`）⚠ 分母是**解析得到的行** |
| 归档 | **34 个带行的批次**（+ `batch-31` 只有 meta，是纯价格条款；编号到 **35**），其中 **20** 个 `collectedWith` 指向 `scripts/`、再加 batch-33 那条 curl（8-20 实测，复算 = 数 `data/sources/*.meta.json` 的 `collectedWith`）⚠ 「裸奔行数」引用前先钉定义 → `TODO.md` |
| 归档里收了不入库 | **3582 行**（8-09 实测），全部带写明理由（`droppedBenchmarks` / 未映射 / 已退役）——拒绝也要可审计 ⚠ 只增不减地长过两次（batch 35 之后至少 +76；8-19 又加进 V4 Pro preview 的全部 132 行）；这个数的取数口径没写下来，引用前先钉定义，别在它上面做减法或加法 |
| 站点 | **`https://quarkspace.top`**（+ `www`，两个都 200）· `/` 个人站 · `/models` 观测台 · **`/deepseek` 静态游戏**（不走 `app/layout.tsx` ⇒ **没有备案页脚**，owner 明确选的，坑 **35**）· **`/ricochet-mech-arena` 静态游戏**（同一处理，`public/` 里的拷贝不跟源仓自动更新；2026-09-14 owner 手动 ReDeploy 后上线，同日实测 push `main` 又会自动部署了，约 7 分钟见线上哈希），同一个仓库，EdgeOne Pages |
| Persona Lab | **`https://quarkspace.top/persona` 已上线**（2026-08-17 实测）：`qwen3.7-flash` 快速候选编译 + 候选筛选后直接探针；服务端凭据已配置且访问口令受保护。线上保存浏览器本地历史，完整 SQLite/JSONL 研究实验仍走本地 Encode Persona harness。 |

⚠ **三个数字一起读，别只读百分比**——加一个基准会同时放大分母。

**域名 / 备案已定案**（细节 → `docs/ARCHITECTURE.md` §6）。⏳ 只剩公安联网备案约 2026-09-09 出结果，
批了**只改一个常量**：`app/beian-filing.ts` 的 `PUBLIC_SECURITY_FILING`（现在是 `null`），
两个 check 不用改一个字就会开始断言它。

**自动化真正剩下的**看 `TODO.md`。⭐ **「上游有、目录没有」不是缺陷清单**,且它**由两处独立算出**
(`report:gaps` 与 `app/api/live-models/route.ts`),判定逻辑只有一个家 `app/upstream-variants.ts`。
⚠⚠ **报告干净 ≠ 网站干净** → `GOTCHAS.md` 19 + `docs/ARCHITECTURE.md` §6。

---

## Historical automation snapshot (verify against current workflows before relying on it)

| 时间（UTC） | 在哪 | 做什么 | 能不能自己合并 |
|---|---|---|---|
| ~08:10（cron 写 06:00，GitHub 实际延迟约两小时） | GitHub Actions `upstream.yml` | **14** 个每日源漂移检查（16 个 fetcher 中 `live`/`append-only` 那些；复算 = `npm run report:column-automation`） → 重抓 live 板 → 发布页探针 → 写 gaps issue → AA 新模型侦测 | 只碰 `data/sources/` + 生成文件 → **直推 main** |
| 同上，末步 | GitHub Actions | 归属闸门 `attribute-and-merge.sh`：提议 alias → 跑契约 → 三条件满足才自合 | 有条件自合，否则留 PR |
| 由 `upstream.yml` 末步按需触发 | GitHub Actions `aa-refresh.yml` | 重读 AA 参数 → `reconcile-aa.mjs` 把重测的 speed/latency 抄进目录 → 契约(**现在是闸**) → 开 PR → 四条件自合 | 有条件自合，否则留 PR |
| 09:30 UTC（10:30 UK） | hermes（Windows 定时任务，canonical job id **`2d4dbdc7db6f`**） | 读 gaps issue → 挑一件完整做完 → 开 PR → **四条件全真就合并并删分支**（2026-09-04 起是指令不是许可） | 有条件自合 |
| 任意 push 到 main | GitHub Actions `ci.yml` | 契约全套 + 归属闸门回测 + 两个分类器自测 + 手机探针（`/models` + 六条 portfolio routes）+ 两份 CV print + 站上新增模型才推微信 | — |
| 相关 portfolio 文件 push 到 main | GitHub Actions `portfolio-production-smoke.yml` | bounded wait for EdgeOne → 六条真实线上 route/content/cross-link checks → 320/390/430 Chrome → 两份 CV print | — |

**三条件**（tier B 自合的唯一门槛，写在 `docs/AGENT-OPERATIONS.md`）：契约全绿（含跨源分歧闸门与
一源两串闸门）· `describe-change` 报告**没有已有数字被改动** · 没有写 `acknowledgedDisagreements`
或 `mergedInOneSource`、`withdrawnRows` 例外（由 `scripts/check-exemptions-untouched.mjs` 比对条目数判定 —— 旧的 grep 判据够不到,见 `GOTCHAS.md` 34）。

⚠ 2026-09-04 起这三条是**指令**:全真就合并并删分支,不真就留 PR 并**点名是哪一条**。
「和相关 PR 一起看」不是第五条件 —— 把能合的压在不能合的后面正是那 10 天的成因。

闸门的 hands-off 判据是 branch-scoped —— 见 `GOTCHAS.md` 坑 13。

---

## Ops 速查

```bash
npm ci
npm run ingest          # 归档 + alias → app/observations.generated.ts（且派生 ARENA_ELO）
npm run lint
npm run check:data      # 观测契约 + 覆盖率
npm run check:models    # 目录每个数字 vs 归档
npm run check:prices    # 促销价是否混进目录
npm run build
npm run check:beian     # 备案号是否进了每一条预渲染路由(读上面 build 的产物)
```

`npm run check:mobile` 在 CI 里跑（`/models` + 六条 portfolio routes）。本地跑前先看 `GOTCHAS.md` 坑 11。

其他常用：

```bash
npm run propose:attribution            # 归属闸门今天能定多少
npm run propose:attribution -- --backtest   # 回测 300 条人工判断（CI 里也跑）
npm run describe-change origin/main    # 这次改动对已发布看板做了什么
npm run report:gaps                    # 什么从来没被采集过
npm run check:upstream                 # 14 个每日源逐格对照
npm run report:column-automation       # 72 列里多少列是每日自动重读的
npm run check:price-drift              # 手抄的 list price 是否落后于 AA
node scripts/fetch-source.mjs arcprize # 单独重抓一个源（arcprize / arcprize-v1 / arcprize-v3）
```

**推送前**：`gh auth switch -u Quarkgluonmixture`（个人账号）。仓库密钥：`AA_API_KEY`、
`PUSHPLUS_TOKEN`，两个都是可选的——缺了对应步骤跳过自己，不会让任何检查变红。

**微信推送 8 条**(9-04 加了「源连续两天读不出来」)（复算 = `grep -rn notify-pushplus .github/workflows scripts`；⚠ §10 的表还停在
8-06 的四条），策略是「只在异常时说话」；细节 → `docs/ARCHITECTURE.md` §10 + 坑 **38/39**
（`main 变红` 按「红的集合变化」推，**沉默 = 没变，不是绿了**；它的 stdout 就是消息）。
**沉默可诊断**：两个调度器互相看守（`scripts/check-heartbeat.mjs` 头部），⚠ 但这个看守是**不对称**的。

---

## Historical watchlist from 2026-08-26 (superseded; use current action queue above)

1. **`auto/refresh-aa` 的第一次真实自合**,以及 hermes 拿到新章程后的第一班。
   两件都只能在真跑里验:GitHub 的 step output 传递(`handsoff`/`escalated`/`moved`)本地验不了,
   hermes 会不会真的按新措辞合并也一样。**它死掉是这套系统里唯一背后没有推送的失败** ⇒
   不会报丧,只会安静地不干活。
   ⛔⛔ **别用 `npm run check:heartbeat -- --agent` 判断 hermes** —— 那条量的是「队列有没有人在做」,
   你自己开一次 session 就把时钟清零(2026-08-26 当场实测:它拿我们自己的 commit 报了绿)。
   ⚠ 它与其他 glm-5.3 重活**共享同一个 5 小时配额窗口** ⇒ 延迟先怀疑配额。
2. **`deepseek-v4-pro` 翻转后的两件小尾巴**(都在 `TODO.md`,都不急):`open` 现在无据 ·
   `value` 这个 chip 还算不算数。
3. **`swe-pro` 第一次自己动**（batch 30 是 `live`）。它读 RSC flight,**不是稳定 API** ——
   挂了应当是**大声 throw**(六条断言),不该是"看板变小了"。见 `docs/ARCHITECTURE.md` §9。

---

## 该读哪份文档

| 文件 | 什么时候读 |
|---|---|
| `AGENTS.md` | **动手之前必读**。操作合同、九项检查、已经踩过的坑 |
| `docs/ARCHITECTURE.md` | 架构、数据政策、§9 采集现状与每个源的判定、§10 已知限制与下一步 |
| `docs/AGENT-OPERATIONS.md` | 排程 agent 的章程：三个风险层级、硬规则、alias 归属规则 |
| `docs/UI.md` | 改任何界面之前：字号地板、断点、手机契约 |
| `docs/INGEST-PROMPT.md` | 要让一个浏览模型抄一批数据时的转录合同 |
| `GOTCHAS.md` | **动手之前扫一遍**：仍会咬人的坑，编号稳定可引用（复算 = `grep -c '^### ' GOTCHAS.md`）。**它自己顶部有一张「你要动 X 就先读 N」的表**，别在这里维护第二份。 |
| `TODO.md` / `LOG.md` | 接下来做什么 / 以前为什么这么做。⚠ LOG 轮转过多次（现存档见 `ls LOG-archive/`）——检索一律 `grep LOG.md LOG-archive/*.md` 两边一起搜 |

Git 状态一律现查（`git log --oneline -5`、`git status`），这里不记 HEAD、不记分支进度。
