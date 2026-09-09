// FrontierSWE V2 leaderboard, read from the RSC flight stream the page server-renders.
//
// §9 of docs/ARCHITECTURE.md used to say this board "publishes nothing machine-readable" — that
// verdict is now the eighth in that table to be overturned by looking again. The page is a
// server-rendered Next.js App Router document (463KB), and the full leaderboard travels inside a
// `self.__next_f.push([1,"…"])` island: chunk `17:[\"$\",\"$L24\",null,{"entries":{"abs":{"best|
// mean|worst":[…]}},"note":…}]`. Decoding is two JSON.parse hops — the script-tag literal, then the
// RSC array — and every field the observation contract wants is there: model, harness, per-stat
// scores, cost, duration. No client rendering to wait for and no browser to drive.
//
// Why a NEW benchmark id (`frontierswe-v2`) rather than refreshing `frontierswe`:
//
//   The archived `frontierswe` column is the V1 board: every model ran its maker's own CLI
//   (Claude Code, Codex, Kimi CLI…), the metric headline was Dominance/AVG RANK (batch 02's notes
//   say "win rate versus a random opponent"), and the vendor release tables carried "Dominance as
//   of <date>" readings of the same shape. V2 replaces all of it: ONE harness ("proximus") for
//   every entry, 34 tasks, 5 trials per task, 20-hour budget per run, headline Mean@5 with
//   Best@5/Worst@5 beside it. The numbers are not comparable — Kimi K3 is 81.2 on the V1 vendor
//   reading and 25.87 Mean@5 on V2 — which is rule 4's exact case, so V2 gets its own column the
//   same way FrontierMath Tier 4 and Terminal-Bench 2.0 did (see `benchmarkSplits`).
//
// Versioning: V2 appends and re-ranks as new models finish their 5×34 runs, and a completed run's
// numbers can also move while more of the 170 trials land. That is the board working, not drift —
// `live`, like DeepSWE and Terminal-Bench.
//
// Standing risk, same class as Terminal-Bench: this is an RSC payload, not a promised interface.
// A restyle that moves the island changes nothing (we scan every island for the `entries` prop),
// but a switch away from the App Router or a pagination of the leaderboard would. The fetcher
// throws rather than writing a partial batch, so the worst case is a "could not be read" line.

const PAGE = "https://www.frontierswe.com/";
const VERSION = "V2";

export const frontierSwe = {
  id: "frontierswe-v2",
  label: "FrontierSWE V2 official leaderboard",
  batch: "batch-43-frontierswe-v2",

  // New trials land continuously; a moved Mean@5 is the board accumulating runs, not drift.
  versioning: "live",

  async fetch() {
    const response = await fetch(PAGE, { headers: { Accept: "text/html" } });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText} — ${PAGE}`);
    const html = await response.text();

    // Every self.__next_f.push island. The regex is non-greedy across the single-quoted JS string
    // literal; a malformed island is skipped by the JSON.parse guard rather than failing the run.
    const islands = [...html.matchAll(/self\.__next_f\.push\(\[1,(".*?")\]\)/gs)].map((m) => m[1]);

    let props = null;
    for (const literal of islands) {
      let chunk;
      try { chunk = JSON.parse(literal); } catch { continue; } // not a string payload — skip
      if (typeof chunk !== "string" || !chunk.includes('"entries"')) continue;
      // RSC row: `<id>:[<tag>,<ref>,<key>,<props>]`. Parse the array after the first colon.
      const args = JSON.parse(chunk.slice(chunk.indexOf(":") + 1));
      const candidate = Array.isArray(args) ? args[3] : null;
      if (candidate && typeof candidate === "object" && candidate.entries?.abs) { props = candidate; break; }
    }
    if (!props) {
      throw new Error(
        `no entries island in ${PAGE} — the flight-stream shape changed; ` +
          "see scripts/fetchers/frontierswe-v2.mjs for how it was found",
      );
    }

    const stats = props.entries.abs;
    if (!Array.isArray(stats.mean) || stats.mean.length === 0) {
      throw new Error(`empty mean array in ${PAGE} — the leaderboard moved or paginated`);
    }
    // The three arrays must describe the same configurations or the per-stat note would lie.
    const keyOf = (row) => `${row.model}/${row.harness}`;
    const keysets = ["best", "mean", "worst"].map((stat) => stats[stat].map(keyOf).sort().join("|"));
    if (new Set(keysets).size !== 1) {
      throw new Error(`best/mean/worst describe different configurations in ${PAGE} — needs a human`);
    }

    // Mean@5 is the headline the page renders (verified: Fable 5.1 56.3 on the page = 56.29 here).
    // Best@5/Worst@5 stay in the note — the catalog carries one metric per cell, and best-of-5
    // would read as a pass rate nobody publishes as the score.
    const byModel = new Map(stats.mean.map((row) => [keyOf(row), row]));
    const best = new Map(stats.best.map((row) => [keyOf(row), row]));
    const worst = new Map(stats.worst.map((row) => [keyOf(row), row]));

    const rows = [];
    for (const row of stats.mean) {
      const key = keyOf(row);
      const score = Number(row.overall);
      if (!row.model || !Number.isFinite(score)) continue;

      const at = (map, stat) => {
        const value = map.get(key)?.overall;
        return Number.isFinite(value) ? `${stat}@5 ${value.toFixed(2)}` : null;
      };
      const extras = [at(best, "best"), at(worst, "worst")].filter(Boolean);

      rows.push({
        model_raw: row.model,
        benchmark: "frontierswe",
        benchmark_version: VERSION,
        score: Number(score.toFixed(2)),
        unit: "%",
        harness: row.harness,
        reasoning_effort: null,
        tools_enabled: true,
        context_length: null,
        // The board publishes no run dates — only the note's "5 trials, 20-hour budget" applies to
        // all rows equally. Leave null rather than stamping a retrieval date as an evaluation date.
        evaluation_date: null,
        source_label: "FrontierSWE V2 official leaderboard",
        source_url: PAGE,
        source_kind: "benchmark",
        note:
          `对象：FrontierSWE V2 的 34 个前沿工程任务（页面自述 "Scores across all 34 tasks. Each model ` +
          `runs 5 trials per task with a 20-hour budget."）；打分：Mean@5 任务得分均值；` +
          `脚手架：全表统一 ${row.harness}（V2 不再是各厂 CLI 各跑一列，与 V1 列不可比）` +
          (extras.length ? `；${extras.join("、")}` : "") +
          (Number.isFinite(row.avgCostUsd) ? `；均成本 $${row.avgCostUsd.toFixed(2)}` : "") +
          (Number.isFinite(row.avgDurationSeconds) ? `；均时长 ${(row.avgDurationSeconds / 3600).toFixed(1)}h` : ""),
      });
    }

    // Stable order: the board's own ranking, then the string as a tiebreak — a refresh that adds
    // one model produces a one-line diff rather than a reshuffle.
    rows.sort((a, b) => b.score - a.score || a.model_raw.localeCompare(b.model_raw));

    const mapped = rows.filter((row) =>
      ["Inkling", "Kimi K3", "Qwen3.8-Max"].includes(row.model_raw)).length;

    return {
      rows,
      version: VERSION,
      summary: `${rows.length} models × Mean@5 (single "${rows[0]?.harness}" harness; ${mapped} resolve to catalog models today)`,
      meta: {
        batch: "43 · FrontierSWE V2 leaderboard",
        collectedWith: "scripts/fetchers/frontierswe-v2.mjs",
        filtered: false,
        release: VERSION,
        sources: [PAGE],
        licence: "FrontierSWE V2 — Proximal, https://www.frontierswe.com/",
        note:
          "Read from the server-rendered RSC flight stream (self.__next_f island 17), not a rendered " +
          "table — the page needs no client JavaScript to carry the board. Cross-checked against the " +
          "page's own rendering on 2026-09-08: Claude Fable 5.1 shows 56.3% on the page against " +
          "56.29 in the island, GPT-5.6 32.2 = 32.2. Two JSON.parse hops: script literal, then the " +
          "RSC array's props element. This overturns §9's 'nothing machine-readable' verdict for " +
          "this board — the eighth reversal in that table. V2 is a DIFFERENT benchmark from the " +
          "archived V1 column (maker-CLI harnesses, Dominance/AVG RANK headline): it gets its own " +
          "catalog id `frontierswe-v2` via benchmarkSplits, same precedent as FrontierMath Tier 4 " +
          "and Terminal-Bench 2.0 — Kimi K3 reads 81.2 on V1's vendor dominance and 25.87 Mean@5 " +
          "here, and merging them in one column is exactly the rule-4 violation that gate exists " +
          "for. Mean@5 is the score; best@5/worst@5, cost and duration stay in the note. No run " +
          "dates are published, so evaluation_date is null — never the retrieval date. The seven " +
          "other strings on the board (Claude Fable 5.1, GPT-5.6, GLM-5.3, Grok 4.6, Gemini 3.7 " +
          "Flash, DeepSeek V4 Flash Exp, Muse Spark 1.2) have no catalog record and no alias; they " +
          "stay in the archive uncounted, which is the intended outcome.",
      },
    };
  },
};
