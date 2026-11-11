"use client";

import { useEffect, useRef } from "react";

// The event display behind the hero and the measurement-chain band.
//
// Four concentric detector layers stand for the four layers of the measurement chain
// (target → harness → judge → evidence). A collision at the centre throws out tracks; each
// track is a claimed result. Some are absorbed at the harness layer, some at the judge layer,
// and only the ones that reach the outer ring deposit a tower there. That is the argument of
// the whole site drawn as a picture: a score is whatever survives the chain that measured it.
//
// ⚠ It is an illustration, not data. Every event is drawn from a PRNG, so the counts the readout
// prints describe the animation and nothing else — the page says so next to them. Do not wire
// real numbers into this without giving them a source row first.

export type EventStats = { id: number; tracks: number; evidence: number; judge: number; harness: number };

type Props = {
  className?: string;
  // "hero": off-centre and large on a wide canvas, stacked on top on a narrow one.
  // "center": centred in its box.
  placement: "hero" | "center";
  labels: readonly [string, string, string, string];
  // Ring to highlight, 0–3, or -1 for none. Driven by the legend beside the canvas.
  focus?: number;
  onFocus?: (ring: number) => void;
  onEvent?: (stats: EventStats) => void;
};

// Ring radii as a fraction of the detector radius R.
const RINGS = [0.27, 0.5, 0.73, 0.95] as const;
const PERIOD = 5.2; // seconds between collisions
const GHOST = 1.5; // how long a finished event lingers under the next one
const QUARK = ["255,90,71", "47,220,158", "95,141,255"] as const; // the three colour charges
const SIGNAL = "255,84,54";
const GOLD = "233,187,63";

type Track = {
  theta: number;
  kappa: number; // signed curvature, in 1/R
  colour: number;
  last: number; // index of the ring that ends it: 1 harness, 2 judge, 3 evidence
  sEnd: number; // path length at that ring
  sCross: number[]; // path length at each ring it reaches
  delay: number;
  dur: number;
  energy: number;
};
type Collision = { id: number; t0: number; tracks: Track[] };
type Noise = { ring: number; angle: number; t0: number };

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// Path length at which a track of curvature k is at distance r from the vertex.
const sAt = (k: number, r: number) => (2 / Math.abs(k)) * Math.asin(Math.min(1, (Math.abs(k) * r) / 2));

function pointAt(track: Track, s: number): [number, number] {
  const { theta, kappa } = track;
  return [
    (Math.sin(theta + kappa * s) - Math.sin(theta)) / kappa,
    (Math.cos(theta) - Math.cos(theta + kappa * s)) / kappa,
  ];
}

function makeCollision(id: number, t0: number, rand: () => number): Collision {
  const count = 17 + Math.floor(rand() * 9);
  // Two loose back-to-back jets plus an isotropic spray, which is what makes it read as a
  // collision rather than a firework.
  const axis = rand() * Math.PI * 2;
  const tracks: Track[] = [];
  for (let i = 0; i < count; i++) {
    const inJet = rand() < 0.6;
    const side = rand() < 0.5 ? 0 : Math.PI;
    const theta = inJet ? axis + side + (rand() - 0.5) * 0.9 : rand() * Math.PI * 2;
    const magnitude = 0.22 + rand() ** 1.6 * 1.45;
    const kappa = (rand() < 0.5 ? -1 : 1) * magnitude;
    const fate = rand();
    const last = fate < 0.17 ? 1 : fate < 0.4 ? 2 : 3;
    const sCross = RINGS.slice(0, last + 1).map((r) => sAt(kappa, r));
    const sEnd = sCross[last];
    tracks.push({
      theta, kappa, last, sEnd, sCross,
      colour: Math.floor(rand() * 3),
      delay: rand() * 0.22,
      dur: 0.75 + sEnd * 0.55,
      energy: 0.25 + rand() * 0.75,
    });
  }
  return { id, t0, tracks };
}

const statsOf = (c: Collision): EventStats => ({
  id: c.id,
  tracks: c.tracks.length,
  evidence: c.tracks.filter((t) => t.last === 3).length,
  judge: c.tracks.filter((t) => t.last === 2).length,
  harness: c.tracks.filter((t) => t.last === 1).length,
});

const easeOut = (p: number) => 1 - (1 - p) ** 3;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export default function Detector({ className, placement, labels, focus = -1, onFocus, onEvent }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Props the draw loop reads live. Held in refs so that hovering a legend row or re-rendering
  // the parent never tears down the canvas and restarts the animation.
  const live = useRef({ labels, focus, onFocus, onEvent });
  useEffect(() => {
    live.current = { labels, focus, onFocus, onEvent };
  }, [labels, focus, onFocus, onEvent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rand = mulberry32((Date.now() ^ 0x9e3779b9) >>> 0);
    const mono = getComputedStyle(canvas).fontFamily || "monospace";

    let w = 0, h = 0, dpr = 1;
    let cx = 0, cy = 0, R = 1;
    let clock = 0, lastFrame = 0, frame = 0;
    let visible = true, hovered = -1;
    let pointer: [number, number] | null = null;
    let nextId = 1;
    let collisions: Collision[] = [];
    let noise: Noise[] = [];
    let nextNoise = 0;

    const layout = () => {
      const box = canvas.getBoundingClientRect();
      w = box.width; h = box.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      if (placement === "hero" && w >= 900) {
        // Parked just past the right edge of the copy column (home.module.css: .heroIn is
        // 1280px wide with 40px gutters, .heroCopy is min(640px, 46vw)) and let overlap it by a
        // little, but never pushed off the right edge of the window.
        R = Math.min(h * 0.4, w * 0.27);
        const copyRight = Math.max(40, (w - 1280) / 2 + 40) + Math.min(640, w * 0.46);
        cx = Math.min(w - R * 1.05 - 8, copyRight - 60 + R); cy = h * 0.485;
      } else if (placement === "hero") {
        // Stacked: the detector owns a square at the top and the copy starts under it. The CSS
        // reserves the same square — keep the two in step (home.module.css, .heroIn).
        const side = Math.min(w, 520);
        R = side * 0.43;
        cx = w / 2; cy = 62 + side / 2;
      } else {
        R = Math.min(w, h) * 0.455;
        cx = w / 2; cy = h / 2;
      }
    };

    const collide = () => {
      const c = makeCollision(nextId++, clock, rand);
      collisions.push(c);
      live.current.onEvent?.(statsOf(c));
    };

    const ringAlpha = (index: number) => {
      const lit = live.current.focus === index || (live.current.focus < 0 && hovered === index);
      return lit ? 1 : 0;
    };

    const drawRings = () => {
      const spokes = 12;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255,255,255,0.045)";
      ctx.beginPath();
      for (let i = 0; i < spokes; i++) {
        const a = (i / spokes) * Math.PI * 2;
        ctx.moveTo(cx + Math.cos(a) * R * RINGS[0], cy + Math.sin(a) * R * RINGS[0]);
        ctx.lineTo(cx + Math.cos(a) * R * RINGS[3], cy + Math.sin(a) * R * RINGS[3]);
      }
      ctx.stroke();

      // The beam axis.
      ctx.setLineDash([2, 7]);
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.beginPath();
      ctx.moveTo(cx - R * 1.6, cy); ctx.lineTo(cx + R * 1.6, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      RINGS.forEach((fraction, index) => {
        const r = R * fraction;
        const lit = ringAlpha(index);
        const stroke = lit ? `rgba(${SIGNAL},0.95)` : "rgba(255,255,255,0.2)";
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lit ? 1.6 : 1;

        if (index === 3) {
          // Evidence: a segmented outer barrel — the towers land on it.
          const cells = 72, gap = 0.012;
          ctx.lineWidth = Math.max(2, R * 0.016);
          ctx.strokeStyle = lit ? `rgba(${SIGNAL},0.7)` : "rgba(255,255,255,0.13)";
          for (let i = 0; i < cells; i++) {
            const a0 = (i / cells) * Math.PI * 2 + gap;
            const a1 = ((i + 1) / cells) * Math.PI * 2 - gap;
            ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1); ctx.stroke();
          }
          return;
        }

        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

        if (index === 1) {
          // Harness: fine outward ticks.
          ctx.lineWidth = 1;
          ctx.strokeStyle = lit ? `rgba(${SIGNAL},0.6)` : "rgba(255,255,255,0.13)";
          ctx.beginPath();
          for (let i = 0; i < 90; i++) {
            const a = (i / 90) * Math.PI * 2;
            const len = i % 5 === 0 ? 0.026 : 0.013;
            ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
            ctx.lineTo(cx + Math.cos(a) * (r + R * len), cy + Math.sin(a) * (r + R * len));
          }
          ctx.stroke();
        }
        if (index === 2) {
          // Judge: a cell layer — two walls and the dividers between them.
          const outer = r + R * 0.04;
          ctx.lineWidth = 1;
          ctx.strokeStyle = lit ? `rgba(${SIGNAL},0.55)` : "rgba(255,255,255,0.11)";
          ctx.beginPath(); ctx.arc(cx, cy, outer, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath();
          for (let i = 0; i < 48; i++) {
            const a = (i / 48) * Math.PI * 2;
            ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
            ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
          }
          ctx.stroke();
        }
      });

      // Layer labels, stacked along one radius like a schematic.
      const angle = (-118 * Math.PI) / 180;
      const size = Math.max(9, Math.min(11, R * 0.03));
      ctx.font = `500 ${size}px ${mono}`;
      ctx.textBaseline = "middle";
      RINGS.forEach((fraction, index) => {
        const text = live.current.labels[index];
        const x = cx + Math.cos(angle) * R * fraction;
        const y = cy + Math.sin(angle) * R * fraction;
        const width = ctx.measureText(text).width;
        const lit = ringAlpha(index);
        ctx.fillStyle = "rgba(8,9,13,0.86)";
        ctx.fillRect(x + 7, y - size * 0.85, width + 12, size * 1.7);
        ctx.fillStyle = lit ? `rgb(${SIGNAL})` : "rgba(255,255,255,0.62)";
        ctx.fillText(text, x + 13, y + 0.5);
        ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
      });
    };

    const drawCollision = (c: Collision, isLatest: boolean) => {
      const age = clock - c.t0;
      // The latest event holds, then dims as the next one approaches; an older one is a ghost.
      const fade = isLatest
        ? 1 - 0.55 * clamp01((age - (PERIOD - 1.6)) / 1.6)
        : 0.45 * (1 - clamp01((age - PERIOD) / GHOST));
      if (fade <= 0) return;

      ctx.globalCompositeOperation = "lighter";

      if (age < 0.7) {
        const flash = 1 - age / 0.7;
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * (0.1 + 0.16 * (1 - flash)));
        glow.addColorStop(0, `rgba(255,255,255,${0.9 * flash})`);
        glow.addColorStop(0.35, `rgba(${SIGNAL},${0.35 * flash})`);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(cx, cy, R * 0.3, 0, Math.PI * 2); ctx.fill();
      }

      for (const track of c.tracks) {
        const progress = clamp01((age - track.delay) / track.dur);
        if (progress <= 0) continue;
        const head = track.sEnd * easeOut(progress);
        const rgb = QUARK[track.colour];
        const lost = track.last < 3;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        const steps = Math.max(6, Math.ceil(head / 0.022));
        for (let i = 1; i <= steps; i++) {
          const [x, y] = pointAt(track, (head * i) / steps);
          ctx.lineTo(cx + x * R, cy + y * R);
        }
        ctx.lineCap = "round";
        ctx.strokeStyle = `rgba(${rgb},${0.13 * fade})`;
        ctx.lineWidth = 4.5;
        ctx.stroke();
        ctx.strokeStyle = `rgba(${rgb},${(lost ? 0.6 : 0.92) * fade})`;
        ctx.lineWidth = 1.15;
        ctx.stroke();

        // Hits where the track crosses a layer.
        track.sCross.forEach((s, ring) => {
          if (head < s) return;
          const [x, y] = pointAt(track, s);
          const terminal = ring === track.last;
          const since = age - track.delay - track.dur * (1 - (1 - s / track.sEnd) ** (1 / 3));
          const ping = clamp01(1 - since / 0.55);
          const px = cx + x * R, py = cy + y * R;
          if (ping > 0) {
            ctx.strokeStyle = `rgba(255,255,255,${0.7 * ping * fade})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(px, py, 2 + (1 - ping) * 9, 0, Math.PI * 2); ctx.stroke();
          }
          if (terminal && lost) {
            // Absorbed: the claim did not survive this layer.
            const arm = 3.6;
            ctx.strokeStyle = `rgba(${SIGNAL},${0.95 * fade})`;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(px - arm, py - arm); ctx.lineTo(px + arm, py + arm);
            ctx.moveTo(px + arm, py - arm); ctx.lineTo(px - arm, py + arm);
            ctx.stroke();
          } else if (!terminal) {
            ctx.fillStyle = `rgba(255,255,255,${0.8 * fade})`;
            ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
          }
        });

        // Reached evidence: a tower on the outer barrel, as tall as the deposit.
        if (!lost && progress >= 1) {
          const [x, y] = pointAt(track, track.sEnd);
          const a = Math.atan2(y, x);
          const grow = easeOut(clamp01((age - track.delay - track.dur) / 0.35));
          const r0 = R * (RINGS[3] + 0.018);
          const r1 = r0 + R * 0.075 * track.energy * grow;
          ctx.strokeStyle = `rgba(${GOLD},${0.95 * fade})`;
          ctx.lineWidth = Math.max(2.5, R * 0.014);
          ctx.lineCap = "butt";
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
          ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const drawNoise = () => {
      // Detector noise: isolated hits that belong to no track. Signal has to be told from this.
      for (const hit of noise) {
        const life = 1 - (clock - hit.t0) / 0.9;
        if (life <= 0) continue;
        const r = R * RINGS[hit.ring];
        ctx.fillStyle = `rgba(255,255,255,${0.42 * life})`;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(hit.angle) * r, cy + Math.sin(hit.angle) * r, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawPointer = () => {
      if (!pointer) return;
      const [px, py] = pointer;
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px - 9, py); ctx.lineTo(px + 9, py);
      ctx.moveTo(px, py - 9); ctx.lineTo(px, py + 9);
      ctx.stroke();
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      drawRings();
      drawNoise();
      collisions.forEach((c, index) => drawCollision(c, index === collisions.length - 1));
      drawPointer();
    };

    const tick = (now: number) => {
      frame = 0;
      if (!visible) return;
      const dt = Math.min(0.05, lastFrame ? (now - lastFrame) / 1000 : 0);
      lastFrame = now;
      clock += dt;

      const latest = collisions[collisions.length - 1];
      if (!latest || clock - latest.t0 >= PERIOD) collide();
      collisions = collisions.filter((c) => clock - c.t0 < PERIOD + GHOST);
      if (clock >= nextNoise) {
        noise.push({ ring: Math.floor(rand() * 4), angle: rand() * Math.PI * 2, t0: clock });
        nextNoise = clock + 0.12 + rand() * 0.3;
      }
      noise = noise.filter((hit) => clock - hit.t0 < 0.9);

      draw();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (reduced || frame) return;
      lastFrame = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    // Reduced motion: one finished event, drawn once, and no loop at all.
    const still = () => {
      collisions = [makeCollision(nextId++, 0, rand)];
      clock = 2.4;
      live.current.onEvent?.(statsOf(collisions[0]));
      draw();
    };

    layout();
    let stillFrame = 0;
    if (reduced) stillFrame = requestAnimationFrame(still);
    else start();

    const resize = new ResizeObserver(() => {
      layout();
      if (reduced && collisions.length) draw();
    });
    resize.observe(canvas);

    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && document.visibilityState === "visible";
      if (visible) start(); else stop();
    });
    seen.observe(canvas);
    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      if (visible) start(); else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const ringUnder = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      const x = event.clientX - box.left, y = event.clientY - box.top;
      pointer = [x, y];
      const distance = Math.hypot(x - cx, y - cy) / R;
      let best = -1;
      RINGS.forEach((fraction, index) => {
        if (Math.abs(distance - fraction) < 0.075) best = index;
      });
      return best;
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const ring = ringUnder(event);
      if (ring !== hovered) {
        hovered = ring;
        live.current.onFocus?.(ring);
      }
      if (reduced) draw();
    };
    const onLeave = () => {
      pointer = null;
      if (hovered !== -1) {
        hovered = -1;
        live.current.onFocus?.(-1);
      }
      if (reduced) draw();
    };
    // A click fires a fresh collision — rate-limited so mashing it cannot stack a hundred.
    const onDown = () => {
      // Reduced motion still gets a new event — it just arrives finished instead of animated.
      if (reduced) return still();
      const latest = collisions[collisions.length - 1];
      if (latest && clock - latest.t0 < 0.5) return;
      collide();
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);

    return () => {
      stop();
      cancelAnimationFrame(stillFrame);
      resize.disconnect();
      seen.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
    };
  }, [placement]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
