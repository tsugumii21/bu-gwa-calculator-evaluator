import type { WeightedGradeTotals } from '../types';

export const SIMULATION_DEFAULT_UNITS = 21;
export const SIMULATION_MAX_UNITS = 200;
export const SIMULATION_DEFAULT_GRADE = 1.5;
export const SIMULATION_MIN_GRADE = 1;
export const SIMULATION_MAX_GRADE = 5;
export const SIMULATION_PASSING_GRADE = 3;
export const SIMULATION_GRADE_SCALE = 10000n;

/** Exact scenario totals use four-decimal grades and variable-precision unit ticks. */
export interface SimulationTotals { points: bigint; unitTicks: bigint; unitScale: bigint }

export const EMPTY_SIMULATION_TOTALS: SimulationTotals = { points: 0n, unitTicks: 0n, unitScale: 1n };

/** Preserves fractional units, including legacy values finer than hundredths. */
export function simulationTotals(units: number, average: number): SimulationTotals {
  const [mantissa, exponent = '0'] = units.toString().split('e');
  const [whole, fraction = ''] = mantissa.split('.');
  const decimals = Math.max(0, fraction.length - Number(exponent));
  const unitScale = 10n ** BigInt(decimals);
  const unitTicks = BigInt(whole + fraction) * 10n ** BigInt(Math.max(0, Number(exponent) - fraction.length));
  return { unitTicks, unitScale, points: BigInt(Math.round(average * Number(SIMULATION_GRADE_SCALE))) * unitTicks };
}

/** Converts the existing saved-grade evidence without rounding its average. */
export function savedSimulationTotals(weighted: WeightedGradeTotals): SimulationTotals {
  return { ...weighted, points: weighted.points * (SIMULATION_GRADE_SCALE / 100n) };
}

export function addSimulationTotals(left: SimulationTotals, right: SimulationTotals): SimulationTotals {
  const unitScale = left.unitScale > right.unitScale ? left.unitScale : right.unitScale;
  const a = unitScale / left.unitScale;
  const b = unitScale / right.unitScale;
  return { points: left.points * a + right.points * b, unitTicks: left.unitTicks * a + right.unitTicks * b, unitScale };
}

export function simulationNumbers(total: SimulationTotals) {
  return {
    points: Number(total.points) / Number(total.unitScale * SIMULATION_GRADE_SCALE),
    units: Number(total.unitTicks) / Number(total.unitScale),
    average: total.unitTicks ? Number(total.points) / Number(total.unitTicks * SIMULATION_GRADE_SCALE) : null,
  };
}

/** Exact comparison; a rounded display must never decide whether a goal is met. */
export function meetsSimulationGoal(total: SimulationTotals, target: number) {
  return total.unitTicks > 0n && total.points <= BigInt(Math.round(target * Number(SIMULATION_GRADE_SCALE))) * total.unitTicks;
}

/** Solves an upper average bound and rounds its recommendation toward the better grade. */
export function solveSimulationGoal(known: SimulationTotals, unknownUnits: number, target: number) {
  const unknown = simulationTotals(unknownUnits, 0);
  const combined = addSimulationTotals(known, unknown);
  const knownPoints = known.points * (combined.unitScale / known.unitScale);
  const unknownTicks = unknown.unitTicks * (combined.unitScale / unknown.unitScale);
  const targetPoints = BigInt(Math.round(target * Number(SIMULATION_GRADE_SCALE))) * combined.unitTicks;
  const numerator = targetPoints - knownPoints;
  if (!unknownTicks) return null;
  const truncated = numerator / unknownTicks;
  const floored = truncated - (numerator < 0n && numerator % unknownTicks ? 1n : 0n);
  return {
    raw: Number(numerator) / Number(unknownTicks * SIMULATION_GRADE_SCALE),
    recommended: Number(floored) / Number(SIMULATION_GRADE_SCALE),
    isUnreachable: numerator < unknownTicks * SIMULATION_GRADE_SCALE,
    allowsPassing: numerator >= unknownTicks * SIMULATION_GRADE_SCALE * BigInt(SIMULATION_PASSING_GRADE),
    targetPoints: Number(targetPoints) / Number(combined.unitScale * SIMULATION_GRADE_SCALE),
    knownPoints: Number(knownPoints) / Number(combined.unitScale * SIMULATION_GRADE_SCALE),
  };
}

export function requiredFutureAverage(currentPoints: number, currentUnits: number, futureUnits: number, target: number): number | null {
  if (![currentPoints, currentUnits, futureUnits, target].every(Number.isFinite) || currentPoints < 0 || currentUnits < 0 || futureUnits <= 0) return null;
  return (target * (currentUnits + futureUnits) - currentPoints) / futureUnits;
}

/** Weighted hypothetical average; null means no units to project. */
export function projectGWA(currentPoints: number, currentUnits: number, futureUnits: number, futureGrade: number): number | null {
  if (![currentPoints, currentUnits, futureUnits, futureGrade].every(Number.isFinite)) return null;
  if (currentPoints < 0 || currentUnits < 0 || futureUnits < 0 || futureGrade < SIMULATION_MIN_GRADE || futureGrade > SIMULATION_MAX_GRADE) return null;
  const totalUnits = currentUnits + futureUnits;
  return totalUnits > 0 ? (currentPoints + futureGrade * futureUnits) / totalUnits : null;
}
