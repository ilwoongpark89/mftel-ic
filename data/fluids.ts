export interface FluidProperties {
  name: string;
  formula: string;
  T_sat: number;      // °C @ 1 atm
  rho_l: number;      // kg/m³ liquid density
  rho_v: number;      // kg/m³ vapor density
  h_fg: number;       // kJ/kg latent heat
  k_l: number;        // W/mK liquid thermal conductivity
  mu_l: number;       // Pa·s liquid dynamic viscosity
  c_pl: number;       // J/kgK liquid specific heat
  sigma: number;      // N/m surface tension
  Pr_l: number;       // liquid Prandtl number
  GWP: number;
  ODP: number;
}

export const fluids: Record<string, FluidProperties> = {
  "novec-7100": {
    name: "Novec 7100",
    formula: "C₄F₉OCH₃",
    T_sat: 61,
    rho_l: 1510,
    rho_v: 9.6,
    h_fg: 112,
    k_l: 0.069,
    mu_l: 0.58e-3,
    c_pl: 1183,
    sigma: 0.0136,
    Pr_l: 9.9,
    GWP: 297,
    ODP: 0,
  },
  "novec-649": {
    name: "Novec 649",
    formula: "C₆F₁₂O",
    T_sat: 49,
    rho_l: 1600,
    rho_v: 13.4,
    h_fg: 88,
    k_l: 0.059,
    mu_l: 0.64e-3,
    c_pl: 1103,
    sigma: 0.0108,
    Pr_l: 12.0,
    GWP: 1,
    ODP: 0,
  },
  "fc-72": {
    name: "FC-72",
    formula: "C₆F₁₄",
    T_sat: 56,
    rho_l: 1680,
    rho_v: 13.3,
    h_fg: 88,
    k_l: 0.057,
    mu_l: 0.64e-3,
    c_pl: 1100,
    sigma: 0.010,
    Pr_l: 12.3,
    GWP: 9300,
    ODP: 0,
  },
  "hfe-7200": {
    name: "HFE-7200",
    formula: "C₄F₉OC₂H₅",
    T_sat: 76,
    rho_l: 1420,
    rho_v: 7.4,
    h_fg: 119,
    k_l: 0.068,
    mu_l: 0.61e-3,
    c_pl: 1220,
    sigma: 0.0136,
    Pr_l: 10.9,
    GWP: 55,
    ODP: 0,
  },
  "water": {
    name: "Water (subcooled)",
    formula: "H₂O",
    T_sat: 100,
    rho_l: 958,
    rho_v: 0.6,
    h_fg: 2257,
    k_l: 0.68,
    mu_l: 0.28e-3,
    c_pl: 4217,
    sigma: 0.0589,
    Pr_l: 1.73,
    GWP: 0,
    ODP: 0,
  },
};

export const fluidKeys = Object.keys(fluids) as (keyof typeof fluids)[];

// ──────────────────────────────────────────────
// Surface types
// ──────────────────────────────────────────────

export interface SurfaceType {
  name: string;
  desc: string;
  C_sf: number;    // Rohsenow surface-fluid constant
  n: number;       // Rohsenow exponent (typically 1.0 for water, 1.7 for others)
  hMultiplier: number; // multiplier on base h for this surface
}

export const surfaces: Record<string, SurfaceType> = {
  "plain": {
    name: "Plain (polished)",
    desc: "Flat polished copper/silicon surface",
    C_sf: 0.013,
    n: 1.7,
    hMultiplier: 1.0,
  },
  "sandblasted": {
    name: "Sandblasted",
    desc: "Roughened metal surface",
    C_sf: 0.0068,
    n: 1.7,
    hMultiplier: 1.5,
  },
  "microporous": {
    name: "Microporous coating",
    desc: "Sintered/porous coating, enhanced nucleation",
    C_sf: 0.0042,
    n: 1.7,
    hMultiplier: 2.5,
  },
  "microfinned": {
    name: "Micro-fin array",
    desc: "Structured micro-fins, area enhancement",
    C_sf: 0.005,
    n: 1.7,
    hMultiplier: 3.0,
  },
  "nanostructured": {
    name: "Nanostructured",
    desc: "Nano-wire/pillar array, max nucleation site density",
    C_sf: 0.0035,
    n: 1.7,
    hMultiplier: 4.0,
  },
};

export const surfaceKeys = Object.keys(surfaces);
