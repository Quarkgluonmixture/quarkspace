import assert from "node:assert/strict";
import test from "node:test";

import { arena } from "../scripts/fetchers/arena.mjs";
import { livebench } from "../scripts/fetchers/livebench.mjs";
import { vals } from "../scripts/fetchers/vals.mjs";
import { readAstroIslandProps, unwrapAstroProps } from "../scripts/lib/astro-props.mjs";

const withFetch = async (handler, run) => {
  const original = globalThis.fetch;
  globalThis.fetch = handler;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
};

const jsonResponse = (value) =>
  new Response(JSON.stringify(value), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

const escapeAttribute = (value) =>
  value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");

const astroIsland = (component, props) =>
  `<astro-island component-url="/_astro/${component}.test.js" props="${escapeAttribute(JSON.stringify(props))}"></astro-island>`;

const astroValue = (value) => [0, value];

test("Astro island lookup can select a named component instead of the largest data prop", () => {
  const html = [
    astroIsland("StackedCostBar", {
      data: astroValue({ overall: { filler: "a".repeat(500) } }),
    }),
    astroIsland("ParetoCurve", {
      data: astroValue({ finance: { "openai/gpt-test": { accuracy: 51 } } }),
    }),
  ].join("");

  const props = readAstroIslandProps(html, "data", "ParetoCurve");
  assert.ok(props);
  assert.equal(
    unwrapAstroProps(props).data.finance["openai/gpt-test"].accuracy,
    51,
  );
});

test("LMArena reads the current Text Arena route and preserves both Elo fields", async () => {
  const requests = [];
  const page = (slug, entry) =>
    `<html><script>window.__data = ${JSON.stringify({
      [`leaderboards/${slug}/leaderboard-snapshots/latest`]: { entries: [entry] },
    })};</script></html>`;

  await withFetch(async (input, init) => {
    const url = String(input);
    requests.push({ url, init });
    if (url.endsWith("/leaderboard/chat/text")) {
      return new Response(page("text-overall-style_control", {
        modelDisplayName: "claude-opus-5-max",
        rating: 1508.58,
        ratingLower: 1502.1,
        ratingUpper: 1515.0,
        votes: 12000,
        modelOrganization: "Anthropic",
      }));
    }
    if (url.endsWith("/leaderboard/code/webdev")) {
      return new Response(page("webdev-overall-raw", {
        modelDisplayName: "claude-opus-5-max",
        rating: 1705.2,
        ratingLower: 1698.0,
        ratingUpper: 1712.0,
        votes: 900,
        modelOrganization: "Anthropic",
      }));
    }
    throw new Error(`Unexpected LMArena URL: ${url}`);
  }, async () => {
    const result = await arena.fetch();
    assert.equal(result.rows.length, 2);

    const textRow = result.rows.find((row) => row.text_elo !== null);
    const codeRow = result.rows.find((row) => row.code_elo !== null);
    assert.equal(textRow.text_elo, 1509);
    assert.equal(codeRow.code_elo, 1705);
    assert.equal(textRow.model_raw, "claude-opus-5-max");
    assert.equal(textRow.maker, "Anthropic");
    assert.equal(textRow.price_input_per_m, null);
    assert.equal(textRow.source_url, "https://arena.ai/leaderboard/chat/text");
    assert.ok(requests.some(({ url }) => url.endsWith("/leaderboard/chat/text")));
    assert.ok(requests.some(({ url }) => url.endsWith("/leaderboard/code/webdev")));
    assert.ok(requests.every(({ init }) => init.headers?.Accept === "text/html"));
  });
});

test("LiveBench reads the official release assets and treats a missing cost file as optional", async () => {
  const requested = [];
  const releaseIndex = "https://api.github.com/repos/LiveBench/livebench.github.io/contents/public";
  const assetBase = "https://raw.githubusercontent.com/LiveBench/livebench.github.io/main/public";

  await withFetch(async (input) => {
    const url = String(input);
    requested.push(url);
    if (url === releaseIndex) {
      return jsonResponse([
        { name: "table_2026_06_25.csv" },
        { name: "categories_2026_06_25.json" },
      ]);
    }
    if (url === `${assetBase}/table_2026_06_25.csv`) {
      return new Response(
        "model,AMPS_Hard,python\r\nclaude-opus-5-max-effort,99.5,80\r\ngpt-test,N/A,72\r\n",
      );
    }
    if (url === `${assetBase}/categories_2026_06_25.json`) {
      return jsonResponse({
        Mathematics: ["AMPS_Hard"],
        "Agentic Coding": ["python"],
      });
    }
    if (url === `${assetBase}/cost_2026_06_25.csv`) {
      return new Response("Not Found", { status: 404, statusText: "Not Found" });
    }
    throw new Error(`Unexpected LiveBench URL: ${url}`);
  }, async () => {
    const result = await livebench.fetch();
    assert.equal(result.version, "2026-06-25");
    assert.equal(result.rows.length, 3);

    const math = result.rows.find((row) => row.benchmark === "livebench-amps-hard");
    const agentic = result.rows.find((row) => row.benchmark === "livebench-python" && row.model_raw === "claude-opus-5-max-effort");
    assert.equal(math.score, 99.5);
    assert.equal(math.reasoning_effort, "max");
    assert.equal(agentic.harness, "mini-SWE-agent");
    assert.equal(agentic.tools_enabled, true);
    assert.ok(requested.includes(`${assetBase}/table_2026_06_25.csv`));
    assert.ok(requested.includes(`${assetBase}/categories_2026_06_25.json`));
    assert.ok(requested.includes(`${assetBase}/cost_2026_06_25.csv`));
    assert.deepEqual(result.meta.sources, [
      `${assetBase}/table_2026_06_25.csv`,
      `${assetBase}/categories_2026_06_25.json`,
    ]);
  });
});

const webSearchHtml = ({ includePareto = true, mismatchOverall = false } = {}) => {
  const overall = {
    "openai/gpt-test": {
      accuracy: 49.076695,
      latency: 395.278729,
      stderr: 2.020759,
      cost_per_test: 8.842075,
      harness: "Keenable",
    },
  };
  const chartOverall = mismatchOverall
    ? { "openai/gpt-test": { ...overall["openai/gpt-test"], accuracy: 48 } }
    : overall;
  const benchmarkView = {
    metadata: astroValue({
      benchmark: "Vals Web Search Index",
      dataset_type: "public",
      updated: "2026-10-21",
      tasks: astroValue({
        overall: "Overall",
        finance: "Finance Search",
        legal: "Legal Search",
      }),
    }),
    tasks: astroValue({
      overall: astroValue(overall),
    }),
  };
  const islands = [
    astroIsland("ScatterGraph", {
      benchmarkView: astroValue(benchmarkView),
      title: "Native vs. independent search tools",
      chart: "pareto",
    }),
    // Deliberately make this other data island larger: selecting by key alone is unsafe.
    astroIsland("StackedCostBar", {
      data: astroValue({ filler: "x".repeat(500) }),
    }),
  ];
  if (includePareto) {
    islands.push(astroIsland("ParetoCurve", {
      data: astroValue({
        overall: astroValue(chartOverall),
        finance: astroValue({
          "openai/gpt-test": {
            accuracy: 53.922621,
            latency: 316.600789,
            stderr: 2.101753,
            cost_per_test: 5.483549,
            harness: "Keenable",
            reasoning_effort: "max",
          },
        }),
        legal: astroValue({
          "openai/gpt-test": {
            accuracy: 44.230769,
            latency: 473.956668,
            stderr: 3.452029,
            cost_per_test: 12.2006,
            harness: "Keenable",
            reasoning_effort: "max",
          },
        }),
      }),
    }));
  }
  return islands.join("");
};

const runValsWithPage = async (html) =>
  withFetch(async (input) => {
    const url = String(input);
    if (url === "https://www.vals.ai/benchmarks") {
      return new Response('<a href="/benchmarks/web_search">Web Search</a>');
    }
    if (url === "https://www.vals.ai/benchmarks/web_search") return new Response(html);
    throw new Error(`Unexpected Vals URL: ${url}`);
  }, () => vals.fetch());

test("Vals AI reads Web Search finance/legal from ParetoCurve without changing overall", async () => {
  const result = await runValsWithPage(webSearchHtml());
  assert.equal(result.rows.length, 3);

  const overall = result.rows.find((row) => row.benchmark === "vals-web-search-index");
  const finance = result.rows.find((row) => row.benchmark === "vals-web-search-index-finance");
  const legal = result.rows.find((row) => row.benchmark === "vals-web-search-index-legal");

  assert.equal(overall.score, 49.077);
  assert.equal(overall.reasoning_effort, null);
  assert.equal(finance.score, 53.923);
  assert.equal(finance.reasoning_effort, "max");
  assert.equal(finance.harness, "Keenable");
  assert.equal(legal.score, 44.231);
  assert.equal(legal.reasoning_effort, "max");
  assert.match(finance.source_label, /Finance Search/);
  assert.match(legal.source_label, /Legal Search/);
});

test("Vals AI fails closed if the Web Search ParetoCurve island disappears", async () => {
  await assert.rejects(
    runValsWithPage(webSearchHtml({ includePareto: false })),
    /web_search: no ParetoCurve data island/,
  );
});

test("Vals AI refuses mismatched overall snapshots across its two islands", async () => {
  await assert.rejects(
    runValsWithPage(webSearchHtml({ mismatchOverall: true })),
    /ParetoCurve overall does not match benchmarkView overall/,
  );
});
