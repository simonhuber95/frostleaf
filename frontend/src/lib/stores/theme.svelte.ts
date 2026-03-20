export type ThemeMode = 'light' | 'dark';

// Fresh Greens palette
const c1 = '#386641'; // dark green
const c2 = '#6A994E'; // medium green
const c3 = '#A7C957'; // light green
const c4 = '#F2E8CF'; // warm cream
const c5 = '#BC4749'; // red accent

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('frostleaf-theme-mode');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

let mode = $state<ThemeMode>(getInitialMode());

export const theme = {
  get mode() {
    return mode;
  },
  toggleMode() {
    mode = mode === 'light' ? 'dark' : 'light';
    localStorage.setItem('frostleaf-theme-mode', mode);
    applyTheme();
  },
  init() {
    applyTheme();
  },
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToOklch(r: number, g: number, b: number): string {
  const toLinear = (c: number) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);

  const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l = Math.cbrt(l_);
  const m = Math.cbrt(m_);
  const s = Math.cbrt(s_);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bv = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const C = Math.sqrt(a * a + bv * bv);
  let h = (Math.atan2(bv, a) * 180) / Math.PI;
  if (h < 0) h += 360;

  return `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${h.toFixed(1)})`;
}

function hexToOklch(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToOklch(r, g, b);
}

function mixHex(hex: string, white: number): string {
  const [r, g, b] = hexToRgb(hex);
  const target = white > 0 ? 255 : 0;
  const amount = Math.abs(white);
  const mix = (c: number) => Math.round(c + (target - c) * amount);
  return rgbToOklch(mix(r), mix(g), mix(b));
}

function applyTheme() {
  const root = document.documentElement;

  root.classList.toggle('dark', mode === 'dark');

  if (mode === 'light') {
    // Light: soft sage background, clean white cards, forest green primary
    root.style.setProperty('--color-background', 'oklch(96.5% 0.008 160)');
    root.style.setProperty('--color-foreground', mixHex(c1, -0.5));
    root.style.setProperty('--color-card', 'oklch(99.5% 0 0)'); // clean white
    root.style.setProperty('--color-card-foreground', mixHex(c1, -0.5));
    root.style.setProperty('--color-popover', 'oklch(99.5% 0 0)');
    root.style.setProperty('--color-popover-foreground', mixHex(c1, -0.5));
    root.style.setProperty('--color-primary', hexToOklch(c1));
    root.style.setProperty('--color-primary-foreground', 'oklch(99% 0 0)');
    root.style.setProperty('--color-secondary', 'oklch(94% 0.015 155)');
    root.style.setProperty('--color-secondary-foreground', mixHex(c1, -0.4));
    root.style.setProperty('--color-muted', 'oklch(94% 0.01 155)');
    root.style.setProperty('--color-muted-foreground', mixHex(c1, 0.15));
    root.style.setProperty('--color-accent', 'oklch(92% 0.02 155)');
    root.style.setProperty('--color-accent-foreground', mixHex(c1, -0.4));
    root.style.setProperty('--color-destructive', hexToOklch(c5));
    root.style.setProperty('--color-destructive-foreground', 'oklch(99% 0 0)');
    root.style.setProperty('--color-border', 'oklch(90% 0.015 155)');
    root.style.setProperty('--color-input', 'oklch(90% 0.015 155)');
    root.style.setProperty('--color-ring', hexToOklch(c2));
  } else {
    // Dark: deep green bg, lighter green accents
    root.style.setProperty('--color-background', mixHex(c1, -0.8));
    root.style.setProperty('--color-foreground', mixHex(c4, 0.1));
    root.style.setProperty('--color-card', mixHex(c1, -0.7));
    root.style.setProperty('--color-card-foreground', mixHex(c4, 0.1));
    root.style.setProperty('--color-popover', mixHex(c1, -0.7));
    root.style.setProperty('--color-popover-foreground', mixHex(c4, 0.1));
    root.style.setProperty('--color-primary', hexToOklch(c3));
    root.style.setProperty('--color-primary-foreground', mixHex(c1, -0.8));
    root.style.setProperty('--color-secondary', mixHex(c1, -0.5));
    root.style.setProperty('--color-secondary-foreground', mixHex(c4, 0.1));
    root.style.setProperty('--color-muted', mixHex(c1, -0.55));
    root.style.setProperty('--color-muted-foreground', mixHex(c4, -0.3));
    root.style.setProperty('--color-accent', mixHex(c2, -0.6));
    root.style.setProperty('--color-accent-foreground', mixHex(c4, 0.1));
    root.style.setProperty('--color-destructive', hexToOklch(c5));
    root.style.setProperty('--color-destructive-foreground', mixHex(c4, 0.1));
    root.style.setProperty('--color-border', mixHex(c1, -0.4));
    root.style.setProperty('--color-input', mixHex(c1, -0.4));
    root.style.setProperty('--color-ring', hexToOklch(c3));
  }
}
