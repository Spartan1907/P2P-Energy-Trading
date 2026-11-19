/**
 * Anti-Manipulation Reputation System for SG2.0 P2P Market
 * Directly addresses RQ1: How vulnerable are reputation-based P2P energy markets
 * to Sybil attacks, collusion, and strategic manipulation?
 */

import { ReputationScore } from './types';

export class ReputationEngine {
  // Aging / decay factor per epoch to deter reputation hoarding and on-off attacks
  private readonly decayFactor: number = 0.96;
  // Pairwise trade volume tracking to detect and discount reciprocal wash trading
  private pairwiseTradeCount: Map<string, number> = new Map();

  /**
   * Initializes a default reputation score for a new participant.
   * Incorporates an Anti-Whitewashing baseline (new identities must earn trust).
   */
  public createInitialScore(isPrivilegedColdStart: boolean = false): ReputationScore {
    // If privileged cold start (part of community fairness policy), give neutral baseline
    const alpha = isPrivilegedColdStart ? 3.0 : 1.5;
    const beta = isPrivilegedColdStart ? 1.5 : 2.5;

    return {
      alpha,
      beta,
      score: Number(((alpha + 1) / (alpha + beta + 2)).toFixed(3)),
      totalTrades: 0,
      fulfilledKwh: 0,
      defaultedKwh: 0,
      consecutiveDefaults: 0,
      lastUpdatedEpoch: 0,
    };
  }

  /**
   * Computes the current Bayesian trust score: R = (alpha + 1) / (alpha + beta + 2)
   */
  public calculateScore(alpha: number, beta: number): number {
    return Number(((alpha + 1) / (alpha + beta + 2)).toFixed(3));
  }

  /**
   * Slide 10: Module 3 — Behavior-Based Reputation Mechanism (EWMA)
   * R_i,t+1 = (1 - beta) * R_i,t + beta * r_i,t
   * r_i,t in [0, 1] derived strictly from verified events:
   * - delivery fraction (delivered / contracted)
   * - reporting accuracy (verified surplus / claimed offer)
   * - settlement success (1 for settled, 0 for default)
   */
  public calculatePerformanceScore(
    deliveryFraction: number,
    reportingAccuracy: number,
    settlementSuccess: boolean,
    weights: { wDelivery: number; wReport: number; wSettle: number } = { wDelivery: 0.5, wReport: 0.3, wSettle: 0.2 }
  ): number {
    const fDelivery = Math.max(0, Math.min(1.0, deliveryFraction));
    const fReport = Math.max(0, Math.min(1.0, reportingAccuracy));
    const fSettle = settlementSuccess ? 1.0 : 0.0;

    const r_it =
      weights.wDelivery * fDelivery +
      weights.wReport * fReport +
      weights.wSettle * fSettle;

    return Number(Math.max(0, Math.min(1.0, r_it)).toFixed(4));
  }

  public updateEwmaReputation(
    currentScore: number,
    performanceScore: number,
    betaEwma: number = 0.2
  ): number {
    const updated = (1 - betaEwma) * currentScore + betaEwma * performanceScore;
    return Number(Math.max(0.01, Math.min(0.99, updated)).toFixed(3));
  }

  /**
   * Records a successfully delivered trade match.
   * Discounts reputation gains between pairs engaged in frequent reciprocal trades (Anti-Wash Trading).
   */
  public recordSuccessfulTrade(
    current: ReputationScore,
    deliveredKwh: number,
    counterpartyId: string,
    participantId: string,
    currentEpoch: number
  ): ReputationScore {
    const pairKey = [participantId, counterpartyId].sort().join('<->');
    const priorPairTrades = this.pairwiseTradeCount.get(pairKey) || 0;
    this.pairwiseTradeCount.set(pairKey, priorPairTrades + 1);

    // Wash-trading discount: if pair has traded repeatedly, diminish marginal reputation gain
    const washTradingDamping = 1 / (1 + Math.log2(1 + priorPairTrades * 0.5));
    const effectiveAlphaGain = deliveredKwh * 0.2 * washTradingDamping;

    const newAlpha = current.alpha + effectiveAlphaGain;
    const newBeta = current.beta;

    return {
      alpha: Number(newAlpha.toFixed(3)),
      beta: Number(newBeta.toFixed(3)),
      score: this.calculateScore(newAlpha, newBeta),
      totalTrades: current.totalTrades + 1,
      fulfilledKwh: Number((current.fulfilledKwh + deliveredKwh).toFixed(2)),
      defaultedKwh: current.defaultedKwh,
      consecutiveDefaults: 0,
      lastUpdatedEpoch: currentEpoch,
    };
  }

  /**
   * Records an unfulfilled trade (default on committed energy delivery or payment).
   * Applies asymmetric slashing to deter phantom energy attacks.
   * If isWeatherShockExempt is true (fairness policy), penalty is forgiven.
   */
  public recordDefaultedTrade(
    current: ReputationScore,
    undeliveredKwh: number,
    currentEpoch: number,
    isWeatherShockExempt: boolean = false
  ): { updatedScore: ReputationScore; wasSlashingApplied: boolean } {
    if (isWeatherShockExempt) {
      // Weather shock detected across feeder nodes: waive harsh reputation slashing
      return {
        updatedScore: {
          ...current,
          totalTrades: current.totalTrades + 1,
          lastUpdatedEpoch: currentEpoch,
        },
        wasSlashingApplied: false,
      };
    }

    // Malicious or unexcused default: apply punitive slashing factor (3x weight)
    const punitiveMultiplier = 3.0 + current.consecutiveDefaults * 1.5;
    const betaIncrease = undeliveredKwh * 0.4 * punitiveMultiplier;

    const newAlpha = current.alpha * 0.92; // Active degradation of past trust
    const newBeta = current.beta + betaIncrease;
    const consecutive = current.consecutiveDefaults + 1;

    return {
      updatedScore: {
        alpha: Number(newAlpha.toFixed(3)),
        beta: Number(newBeta.toFixed(3)),
        score: this.calculateScore(newAlpha, newBeta),
        totalTrades: current.totalTrades + 1,
        fulfilledKwh: current.fulfilledKwh,
        defaultedKwh: Number((current.defaultedKwh + undeliveredKwh).toFixed(2)),
        consecutiveDefaults: consecutive,
        lastUpdatedEpoch: currentEpoch,
      },
      wasSlashingApplied: true,
    };
  }

  /**
   * Applies periodic time-decay across all participants to prevent reputation hoarding.
   */
  public applyEpochTimeDecay(current: ReputationScore, currentEpoch: number): ReputationScore {
    const newAlpha = Math.max(1.0, current.alpha * this.decayFactor);
    const newBeta = Math.max(1.0, current.beta * this.decayFactor);

    return {
      ...current,
      alpha: Number(newAlpha.toFixed(3)),
      beta: Number(newBeta.toFixed(3)),
      score: this.calculateScore(newAlpha, newBeta),
      lastUpdatedEpoch: currentEpoch,
    };
  }

  /**
   * Calculates the required security collateral (escrow stake) for submitting a bid.
   * High-trust nodes require lower escrow; low-trust or unverified nodes require higher bond.
   */
  public calculateRequiredCollateral(
    score: number,
    energyKwh: number,
    basePrice: number,
    isDynamicStakingEnabled: boolean
  ): number {
    const nominalValue = energyKwh * basePrice;
    if (!isDynamicStakingEnabled) {
      // Flat high bond creates capital barriers for low-income participants
      return Number((nominalValue * 1.5).toFixed(2));
    }

    // Progressive dynamic bond: Trustworthy participants need only 20-40% collateral,
    // suspicious nodes need 120-150%
    const collateralRatio = Math.max(0.2, 1.4 - score * 1.1);
    return Number((nominalValue * collateralRatio).toFixed(2));
  }
}
