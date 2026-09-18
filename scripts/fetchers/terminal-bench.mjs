// Terminal-Bench 2.1 and 4.0, read from the Supabase function the leaderboard page calls.
//
// The page renders client-side, so batch 02 transcribed it by eye. Harbor's own client posts a
// package/name selector to an Edge Function and gets the rows back; the call needs no key.
//
// The payload is the best-shaped source in the archive. One row carries the model, the agent that
// ran it, the reasoning effort, the run date, accuracy, trial count, pass@2..5 and a reward-hacking
// rate — every field the observation contract asks of a benchmark-native system result, including
// the harness that check:data requires and that a transcription of this board keeps losing.
//
// Standing risk: this is an undocumented endpoint discovered in client code, not a promised
// interface. It can move without notice. That is survivable here — the fetcher throws, the scheduled
// job reports it, and the archive is left exactly as it was.
//
// 2026-09-17: the same endpoint also serves 4.0. The package name changed shape — 2.1 lives at
// `terminal-bench/terminal-bench-2-1` with selector `main`, while 4.0 is the bare
// `terminal-bench/terminal-bench` with selector `4-0-0` (read off the leaderboard page's own
// dehydrated React Query state, not guessed: `name: "4-0-0"`). One fetch now reads both boards
// into one batch, and each row's benchmark_version keeps the cell routing honest — 2.1 stays in
// `terminal`, 4.0 is routed to `terminal-40` by benchmarkSplits, exactly the way 2.0 is.

const ENDPOINT = "https://ofhuhcpkvzjlejydnvyd.supabase.co/functions/v1/leaderboard-read";
const BOARDS = [
  { package: "terminal-bench/terminal-bench-2-1", name: "main", version: "2.1", benchmark: "terminal", page: "https://www.tbench.ai/leaderboard/terminal-bench/2.1" },
  { package: "terminal-bench/terminal-bench", name: "4-0-0", version: "4.0", benchmark: "terminal-40", page: "https://www.tbench.ai/leaderboard/terminal-bench/4.0" },
];

const label = (value) => (value && typeof value === "object" ? value.label : value) ?? null;

export const terminalBench = {
  id: "terminal-bench",
  label: "Terminal-Bench",
  batch: "batch-13-terminal-bench",
  // The board accepts new submissions and re-ranks in place; new rows are new data.
  versioning: "live",

  async fetch() {
    const rows = [];
    for (const board of BOARDS) {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ package: board.package, name: board.name }),
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText} — ${ENDPOINT} (${board.package}/${board.name})`);
      const payload = await response.json();
      const entries = payload?.rows;
      if (!Array.isArray(entries) || entries.length === 0) {
        throw new Error(`no rows for ${board.version} in the Terminal-Bench response — the endpoint changed shape`);
      }

    for (const entry of entries) {
      const meta = entry.metadata ?? {};
      const metrics = entry.metrics ?? {};
      const model = label(meta.model_display);
      const agent = label(meta.agent_display);
      const score = Number(metrics.accuracy);
      // A row missing its model or its scaffold cannot be filed: this benchmark measures the pair,
      // and a system result without a named harness fails the observation contract anyway.
      if (!model || !agent || !Number.isFinite(score)) continue;

      const passAt = [2, 3, 4, 5]
        .map((k) => [k, metrics[`pass_at_${k}`]])
        .filter(([, value]) => Number.isFinite(value))
        .map(([k, value]) => `pass@${k} ${(value * 100).toFixed(1)}`);

      rows.push({
        model_raw: model,
        benchmark: board.benchmark,
        benchmark_version: board.version,
        score: Number(score.toFixed(2)),
        unit: "%",
        harness: agent,
        reasoning_effort: meta.reasoning_effort ?? null,
        tools_enabled: true,
        context_length: null,
        evaluation_date: meta.date ?? null,
        source_label: `Terminal-Bench ${board.version} leaderboard`,
        source_url: board.page,
        source_kind: "benchmark",
        note:
          `对象：Terminal-Bench ${board.version} 任务集，经 ${agent} 脚手架在终端环境内执行；` +
          `打分：任务通过率` +
          (Number.isFinite(metrics.n_trials) ? `；${metrics.n_trials} 次试验` : "") +
          (passAt.length ? `；${passAt.join("、")}` : "") +
          (Number.isFinite(metrics.reward_hacks) ? `；奖励作弊率 ${metrics.reward_hacks}%` : "") +
          (label(meta.pr_url) ? `；提交 ${label(meta.pr_url)}` : ""),
      });
    }
    }

    const efforts = rows.filter((row) => row.reasoning_effort !== null).length;
    const perBoard = BOARDS.map((board) => `${board.version}: ${rows.filter((row) => row.benchmark === board.benchmark).length}`).join(", ");
    return {
      rows,
      version: BOARDS.map((board) => board.version).join(" + "),
      summary: `${rows.length} submissions (${perBoard}; ${efforts} carry a published effort)`,
      meta: {
        batch: "13 · Terminal-Bench 2.1 + 4.0",
        collectedWith: "scripts/fetchers/terminal-bench.mjs",
        filtered: false,
        release: BOARDS.map((board) => board.version).join(" + "),
        sources: BOARDS.flatMap((board) => [ENDPOINT, board.page]),
        note:
          "Fetched from the Supabase Edge Function the leaderboard page itself calls, discovered " +
          "in Harbor's client code; it needs no key. One row per published submission — the board " +
          "measures a model/scaffold pair, so the agent is recorded as the harness and rows are " +
          "never merged across scaffolds. Reasoning effort and run date come from the row's own " +
          "metadata. pass@2..5, trial count and the reward-hacking rate stay in the note because " +
          "the catalog carries one metric per cell. This endpoint is undocumented and may move " +
          "without notice; the fetcher throws rather than writing a partial batch. Supersedes the " +
          "2.1 rows batch 02 transcribed from the same board — recorded in data/model-aliases.json. " +
          "The 2.0 rows in batch 02 are a different benchmark id and are untouched. 4.0 is a " +
          "separate task set and lands in the terminal-40 column via benchmarkSplits; the 4.0 " +
          "selector (4-0-0 on the bare terminal-bench package) was read from the leaderboard " +
          "page's own dehydrated query state.",
      },
    };
  },
};
