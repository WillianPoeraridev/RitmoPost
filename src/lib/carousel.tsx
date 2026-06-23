import type { CalendarDay } from "./schema";
import { PILLAR_LABELS } from "./schema";

// ── Motor de carrossel ──────────────────────────────────────────────────────
// Renderização DETERMINÍSTICA (Satori/next-og), não difusão: texto PT-BR sempre
// legível, cor de marca exata, consistência 100% entre os slides, custo ~R$0.
// A IA (claude.ts) já escreveu o conteúdo; aqui só montamos o visual on-brand.
//
// Cor: vem da MARCA do cliente (hex). O pilar (método MoneyBranding) entra como
// RÓTULO de texto, não como cor — no artefato público quem manda é a marca dele.
// A codificação por cor do pilar continua viva onde serve: grid e PDF (planejamento).

export const SLIDE_W = 1080;
export const SLIDE_H = 1350; // 4:5 — o formato que mais ocupa o feed do Instagram

export const DEFAULT_COLOR = "#f43f5e"; // coral RitmoPost
export type Theme = "dark" | "light";

// ── Utilidades de cor (derivam tons contraste-seguros a partir de 1 hex) ──────
type RGB = { r: number; g: number; b: number };

function parseHex(hex: string): RGB {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

const toHex = ({ r, g, b }: RGB): string =>
  "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

// Mistura `c` com `target` na proporção t (0 = c, 1 = target).
function mix(c: string, target: string, t: number): string {
  const a = parseHex(c);
  const b = parseHex(target);
  return toHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  });
}

// Luminância percebida (0..1) — decide texto claro vs escuro sobre a cor.
function luminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function isValidHex(s: string | null | undefined): s is string {
  return !!s && /^#[0-9a-fA-F]{6}$/.test(s);
}

// Paleta completa derivada de UMA cor de marca + tema. Garante contraste:
// nenhuma combinação sai ilegível mesmo com cor escura ou clara da marca.
export type Palette = {
  bg: string;
  ink: string; // canto do gradiente (tom profundo/claro da marca)
  fg: string; // texto principal
  accent: string; // barra, pill, seta
  accentText: string; // texto colorido sobre o fundo (handle, kicker) — contraste garantido
  onAccent: string; // texto sobre o preenchimento accent (rótulo do pill)
  muted: string;
  muted2: string;
};

export function resolvePalette(color?: string, theme: Theme = "dark"): Palette {
  const accent = isValidHex(color) ? color : DEFAULT_COLOR;
  const lum = luminance(accent);
  // Texto sobre o accent: escuro tingido se o accent for claro/médio, branco se escuro.
  const onAccent = lum < 0.38 ? "#ffffff" : mix(accent, "#000000", 0.84);

  if (theme === "light") {
    return {
      bg: "#ffffff",
      ink: mix(accent, "#ffffff", 0.9),
      fg: "#0a0a0a",
      accent,
      // escurece o accent pra ler bem sobre branco
      accentText: mix(accent, "#000000", lum > 0.6 ? 0.4 : 0.18),
      onAccent,
      muted: "#525252",
      muted2: "#a3a3a3",
    };
  }
  return {
    bg: "#0a0a0a",
    ink: mix(accent, "#000000", 0.86),
    fg: "#fafafa",
    accent,
    // clareia o accent pra ler bem sobre preto (mais ainda se a cor for escura)
    accentText: mix(accent, "#ffffff", lum < 0.3 ? 0.45 : 0.22),
    onAccent,
    muted: "#a3a3a3",
    muted2: "#525252",
  };
}

export type Brand = {
  businessName: string;
  /** sem o @ — adicionado na renderização */
  handle?: string;
  /** URL pública da logo (R2). next/og busca a imagem ao renderizar. */
  logoUrl?: string | null;
};

export type Slide =
  | { kind: "cover"; pillarLabel: string; type: string; hook: string }
  | { kind: "content"; kicker: string; body: string }
  | { kind: "cta"; body: string };

// Quebra a legenda em frases curtas, descartando linhas que são só hashtags.
function splitSentences(text: string): string[] {
  return text
    .split(/\n+|(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !/^#/.test(s));
}

const CTA_RE =
  /agend|chama|link na bio|pe[çc]a|garanta|aproveite|reserve|marque|cli(que|ck)|@|whats|pix|fale|vem (pra|pro)|t[áa] esperando/i;

const PILLAR_CTA: Record<string, string> = {
  atracao: "Segue a gente pra não perder o próximo.",
  conexao: "Salva esse post e marca quem precisa ver.",
  conversao: "Chama no direct e garante o seu.",
};

// Monta o carrossel a partir de um dia do calendário. Tudo derivado do que a IA
// já gerou — sem nova chamada de modelo, sem custo extra.
export function buildCarousel(day: CalendarDay, _brand: Brand): Slide[] {
  const slides: Slide[] = [];

  // 1) Capa: o hook para o scroll. Pilar entra como rótulo de texto.
  slides.push({
    kind: "cover",
    pillarLabel: day.pillar ? PILLAR_LABELS[day.pillar] : "",
    type: day.type,
    hook: day.hook,
  });

  // 2..k) Conteúdo: as frases da legenda viram pontos. A última frase, se soar
  // como chamada, vira o slide de CTA no fim.
  const sentences = splitSentences(day.caption);
  let ctaText: string | null = null;
  if (sentences.length > 1 && CTA_RE.test(sentences[sentences.length - 1])) {
    ctaText = sentences.pop()!;
  }

  const body = sentences.length > 0 ? sentences : [day.theme];
  for (const s of body) {
    slides.push({ kind: "content", kicker: day.theme, body: s });
  }

  // k+1) CTA: a chamada extraída, ou uma padrão coerente com o pilar.
  slides.push({
    kind: "cta",
    body: ctaText ?? (day.pillar ? PILLAR_CTA[day.pillar] : "Chama a gente no direct."),
  });

  return slides;
}

// ── Tipografia responsiva ────────────────────────────────────────────────────
function fitHook(len: number): number {
  if (len > 110) return 58;
  if (len > 70) return 70;
  if (len > 40) return 84;
  return 96;
}
function fitBody(len: number): number {
  if (len > 180) return 42;
  if (len > 110) return 50;
  if (len > 60) return 58;
  return 66;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

// ── Template visual (um componente, varia por kind) ──────────────────────────
// Só flexbox e CSS suportado pelo Satori. Sem grid.
export function SlideView({
  slide,
  brand,
  p,
  index,
  total,
}: {
  slide: Slide;
  brand: Brand;
  p: Palette;
  index: number; // 0-based
  total: number;
}) {
  const handle = brand.handle ? `@${brand.handle.replace(/^@/, "")}` : brand.businessName;

  const root: React.CSSProperties = {
    width: SLIDE_W,
    height: SLIDE_H,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 92,
    fontFamily: "Inter",
    color: p.fg,
    backgroundColor: p.bg,
    backgroundImage: `linear-gradient(155deg, ${p.bg} 0%, ${p.bg} 55%, ${p.ink} 100%)`,
  };

  // Barra de acento — assinatura visual presente em todos os slides.
  const accentBar = (
    <div style={{ display: "flex", width: 96, height: 12, borderRadius: 8, backgroundColor: p.accent }} />
  );

  // Logo do cliente (R2), quando houver. next/og infere as dimensões da imagem.
  const logo = brand.logoUrl ? (
    <div style={{ display: "flex", height: 64, alignItems: "center" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={brand.logoUrl} height={64} style={{ height: 64, objectFit: "contain" }} alt="" />
    </div>
  ) : null;

  // Rodapé de marca compartilhado por slides de conteúdo/CTA.
  const footer = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <div style={{ display: "flex", fontSize: 30, fontWeight: 600, color: p.accentText }}>{handle}</div>
      <div style={{ display: "flex", fontSize: 26, fontWeight: 600, color: p.muted2, letterSpacing: 1 }}>
        {pad2(index + 1)} / {pad2(total)}
      </div>
    </div>
  );

  if (slide.kind === "cover") {
    return (
      <div style={root}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {slide.pillarLabel ? (
              <div
                style={{
                  display: "flex",
                  fontSize: 26,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  color: p.onAccent,
                  backgroundColor: p.accent,
                  padding: "10px 22px",
                  borderRadius: 999,
                }}
              >
                {slide.pillarLabel}
              </div>
            ) : (
              accentBar
            )}
            <div style={{ display: "flex", fontSize: 26, fontWeight: 600, color: p.muted, letterSpacing: 2, textTransform: "uppercase" }}>
              {slide.type}
            </div>
          </div>
          {logo}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {accentBar}
          <div style={{ display: "flex", fontSize: fitHook(slide.hook.length), fontWeight: 800, lineHeight: 1.04, letterSpacing: -1 }}>
            {slide.hook}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", fontSize: 32, fontWeight: 600, color: p.accentText }}>{handle}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 28, fontWeight: 600, color: p.muted }}>
            arraste
            <div style={{ display: "flex", fontSize: 34, color: p.accent }}>→</div>
          </div>
        </div>
      </div>
    );
  }

  if (slide.kind === "content") {
    return (
      <div style={root}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {accentBar}
          <div style={{ display: "flex", fontSize: 28, fontWeight: 800, color: p.accentText, textTransform: "uppercase", letterSpacing: 2 }}>
            {slide.kicker}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: fitBody(slide.body.length), fontWeight: 600, lineHeight: 1.28, letterSpacing: -0.5 }}>
          {slide.body}
        </div>
        {footer}
      </div>
    );
  }

  // cta
  return (
    <div style={{ ...root, backgroundImage: `linear-gradient(155deg, ${p.ink} 0%, ${p.bg} 60%)` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        {accentBar}
        {logo}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
        <div style={{ display: "flex", fontSize: 26, fontWeight: 600, color: p.muted, letterSpacing: 3, textTransform: "uppercase" }}>
          é com você
        </div>
        <div style={{ display: "flex", fontSize: fitHook(slide.body.length), fontWeight: 800, lineHeight: 1.08, letterSpacing: -1, color: p.fg }}>
          {slide.body}
        </div>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 800, color: p.accentText }}>{handle}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", fontSize: 24, fontWeight: 600, color: p.muted2 }}>
          feito com RitmoPost
        </div>
        <div style={{ display: "flex", fontSize: 26, fontWeight: 600, color: p.muted2, letterSpacing: 1 }}>
          {pad2(index + 1)} / {pad2(total)}
        </div>
      </div>
    </div>
  );
}
