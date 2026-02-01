import { fluids, surfaces, FluidProperties, SurfaceType } from "@/data/fluids";

export type CoolingMethod = "natural" | "forced" | "immersion";

export interface ThermalInput {
  tdp: number;
  chipArea: number;     // mm²
  ambientTemp: number;  // °C
  selectedMethods: CoolingMethod[];
}

export interface ImmersionParams {
  fluidKey: string;
  surfaceKey: string;
  fluidTemp: number;      // °C (bulk fluid / subcooling reference)
  angle: number;          // ° surface inclination (0 = horizontal up, 90 = vertical)
  flowVelocity: number;   // m/s external forced flow velocity
}

export interface CoolingResult {
  chipTemp: number;
  deltaT: number;
  h: number;
  heatFlux: number;     // W/cm²
  coolingPower: number;
  method: string;
  key: CoolingMethod;
}

export interface ComparisonResult {
  results: CoolingResult[];
}

// ──────────────────────────────────────────────
// q'' = h · ΔT  →  ΔT = q'' / h
// ──────────────────────────────────────────────

// Air cooling h values (W/m²K)
const H_AIR: Record<"natural" | "forced", number> = {
  natural: 10,
  forced: 80,
};

function calcAirMethod(
  input: ThermalInput,
  method: "natural" | "forced"
): CoolingResult {
  const A = input.chipArea * 1e-6;
  const qPP = input.tdp / A;
  const qCm2 = input.tdp / (input.chipArea * 0.01);

  const h = H_AIR[method];
  const deltaT = qPP / h;
  const chipTemp = input.ambientTemp + deltaT;

  let coolingPower = 0;
  if (method === "forced") coolingPower = Math.round(input.tdp * 0.04 + 15);

  return {
    chipTemp: round1(chipTemp),
    deltaT: round1(deltaT),
    h,
    heatFlux: round1(qCm2),
    coolingPower,
    method: method === "natural" ? "Natural Convection (Air)" : "Forced Convection (Fan)",
    key: method,
  };
}

// ──────────────────────────────────────────────
// Immersion cooling calculation
// ──────────────────────────────────────────────

/**
 * Calculate effective h for immersion cooling.
 *
 * Base h from simplified Rohsenow + surface multiplier:
 *   h_base ≈ 3000–4000 W/m²K for typical dielectric on plain surface
 *
 * Modifiers:
 *   - Surface type: hMultiplier (1x–4x)
 *   - Angle: boiling h degrades with inclination
 *       0° (horizontal upward): 1.0x
 *       90° (vertical): ~0.85x
 *       180° (downward): ~0.5x
 *   - Flow velocity: forced convection adds to boiling h
 *       h_total = h_boiling + h_forced_liquid
 *       h_forced ≈ 0.023 * Re^0.8 * Pr^0.4 * k/L (Dittus-Boelter approx)
 *       Simplified: adds ~200–2000 W/m²K for 0.1–2 m/s
 *   - Subcooling: fluid temp below T_sat reduces effective ΔT
 */
function calcImmersionH(
  fluid: FluidProperties,
  surface: SurfaceType,
  angle: number,
  flowVelocity: number,
): number {
  // Base boiling h for the fluid (nucleate pool boiling on plain surface)
  // Approximate from fluid properties: higher k_l and lower sigma → higher h
  const h_base = 800 * Math.pow(fluid.k_l / 0.06, 0.6)
               * Math.pow(0.012 / fluid.sigma, 0.3)
               * Math.pow(fluid.rho_l / 1500, 0.3)
               / Math.pow(fluid.mu_l / 0.5e-3, 0.2);

  // Scale: aim for ~3000-4000 for Novec 7100 plain, ~10000+ for water
  const h_boiling = h_base * surface.hMultiplier;

  // Angle correction (cosine-based degradation)
  // 0° = best (horizontal upward), graceful decline
  const angleRad = (angle * Math.PI) / 180;
  const angleFactor = Math.max(0.4, 1 - 0.6 * Math.pow(Math.sin(angleRad / 2), 2));

  // Forced flow enhancement (simplified Dittus-Boelter on chip scale)
  // Characteristic length ~ sqrt(chipArea) but we use a fixed ~30mm
  const L_char = 0.03; // m
  let h_flow = 0;
  if (flowVelocity > 0) {
    const Re = (fluid.rho_l * flowVelocity * L_char) / fluid.mu_l;
    h_flow = 0.023 * Math.pow(Re, 0.8) * Math.pow(fluid.Pr_l, 0.4) * (fluid.k_l / L_char);
  }

  return round1(h_boiling * angleFactor + h_flow);
}

export function calcImmersion(
  tdp: number,
  chipArea: number,
  params: ImmersionParams,
): CoolingResult {
  const fluid = fluids[params.fluidKey];
  const surface = surfaces[params.surfaceKey];

  const A = chipArea * 1e-6;
  const qPP = tdp / A;
  const qCm2 = tdp / (chipArea * 0.01);

  const h = calcImmersionH(fluid, surface, params.angle, params.flowVelocity);

  // ΔT = q'' / h (superheat above reference temp)
  // Reference: for boiling, use T_sat; subcooling shifts reference down
  const subcooling = Math.max(0, fluid.T_sat - params.fluidTemp);
  const T_ref = fluid.T_sat; // chip temp still referenced to T_sat for boiling
  const deltaT = qPP / h;
  // Effective chip temp: T_sat + ΔT - subcooling benefit (reduces bulk temp)
  // But chip surface temp = T_sat + superheat regardless of subcooling
  // Subcooling helps condenser, not chip surface directly in pool boiling
  const chipTemp = T_ref + deltaT;

  // Pump + condenser power (slightly higher flow → more pump)
  const pumpBase = tdp * 0.01 + 3;
  const pumpFlow = params.flowVelocity > 0 ? params.flowVelocity * 8 : 0;
  const coolingPower = Math.round(pumpBase + pumpFlow);

  return {
    chipTemp: round1(chipTemp),
    deltaT: round1(deltaT),
    h,
    heatFlux: round1(qCm2),
    coolingPower,
    method: `Immersion (${fluid.name})`,
    key: "immersion",
  };
}

// ──────────────────────────────────────────────
// Generic entry points (air cooling uses old path)
// ──────────────────────────────────────────────

export function calculateSelected(input: ThermalInput): ComparisonResult {
  return {
    results: input.selectedMethods.map((m) => {
      if (m === "immersion") {
        // default params for non-immersion-tab usage
        return calcImmersion(input.tdp, input.chipArea, {
          fluidKey: "novec-7100",
          surfaceKey: "plain",
          fluidTemp: 50,
          angle: 0,
          flowVelocity: 0,
        });
      }
      return calcAirMethod(input, m);
    }),
  };
}

// ──────────────────────────────────────────────
// Curve generation for charts
// ──────────────────────────────────────────────

export interface CurvePoint {
  qCm2: number;
  [key: string]: number;
}

export function generateCurveData(
  chipArea: number,
  maxTdp: number,
  ambientTemp: number,
  methods: CoolingMethod[],
  immersionParams?: ImmersionParams,
  steps: number = 50,
): CurvePoint[] {
  const qMaxCm2 = maxTdp / (chipArea * 0.01);
  const data: CurvePoint[] = [];

  // Pre-compute immersion h (constant for given params)
  let h_imm = 4000;
  let T_ref_imm = 61;
  if (immersionParams) {
    const fluid = fluids[immersionParams.fluidKey];
    const surface = surfaces[immersionParams.surfaceKey];
    h_imm = calcImmersionH(fluid, surface, immersionParams.angle, immersionParams.flowVelocity);
    T_ref_imm = fluid.T_sat;
  }

  for (let i = 0; i <= steps; i++) {
    const qCm2 = (qMaxCm2 * i) / steps;
    const qPP = qCm2 * 1e4;
    const point: CurvePoint = { qCm2: round1(qCm2) };

    for (const m of methods) {
      if (m === "immersion") {
        point[m] = round1(T_ref_imm + qPP / h_imm);
      } else {
        const h = H_AIR[m];
        point[m] = round1(ambientTemp + qPP / h);
      }
    }
    data.push(point);
  }
  return data;
}

export interface PowerPoint {
  qCm2: number;
  [key: string]: number;
}

export function generatePowerCurve(
  chipArea: number,
  maxTdp: number,
  methods: CoolingMethod[],
  flowVelocity: number = 0,
  steps: number = 50,
): PowerPoint[] {
  const qMaxCm2 = maxTdp / (chipArea * 0.01);
  const data: PowerPoint[] = [];

  for (let i = 0; i <= steps; i++) {
    const qCm2 = (qMaxCm2 * i) / steps;
    const Q = qCm2 * (chipArea * 0.01);
    const point: PowerPoint = { qCm2: round1(qCm2) };

    for (const m of methods) {
      if (m === "natural") point[m] = 0;
      else if (m === "forced") point[m] = round1(Q * 0.04 + 15);
      else if (m === "immersion") {
        const pumpFlow = flowVelocity > 0 ? flowVelocity * 8 : 0;
        point[m] = round1(Q * 0.01 + 3 + pumpFlow);
      }
    }
    data.push(point);
  }
  return data;
}

export function energySavingsPercent(
  baseline: CoolingResult,
  improved: CoolingResult
): number {
  if (baseline.coolingPower === 0) return 0;
  return Math.round(
    ((baseline.coolingPower - improved.coolingPower) / baseline.coolingPower) * 100
  );
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}
