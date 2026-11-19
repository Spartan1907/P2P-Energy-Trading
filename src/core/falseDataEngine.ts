/**
 * False Energy / Data Oracle & Reputation Manipulation Engine for SG2.0
 * Problem 1: Sellers claim more energy than physically available
 *            (DATA INTEGRITY ≠ DATA TRUTHFULNESS)
 * Problem 3: Fake ratings, ballot stuffing, and reputation inflation via Sybil puppets
 */

import { Participant, Order, ReputationManipulationMetrics, SystemFairnessPolicies } from './types';
import { CryptoPrivacyService } from './cryptoPrivacy';

export class FalseDataEngine {
  private claimedVsActual: Map<string, { claimed: number; actual: number }> = new Map();
  private fakeRatingsLog: Array<{ from: string; to: string; rating: number; isFake: boolean; blocked: boolean }> = [];

  /**
   * Problem 1: FALSE ENERGY & FALSE DATA
   * Seller A claims 10 kWh available, physical system can deliver only 4 kWh.
   * Blockchain records claims accurately but cannot guarantee physical truth.
   */
  public injectFalseDataOrders(
    participants: Participant[],
    basePricePerKwh: number,
    policies: SystemFairnessPolicies,
    currentEpoch: number
  ): { injectedOrders: Order[]; metrics: Partial<ReputationManipulationMetrics> } {
    const injectedOrders: Order[] = [];
    let falseDataClaimsKwh = 0;
    let actualDeliveredKwh = 0;
    let dataIntegrityViolationRate = 0;
    let oracleVerificationRate = 0;
    let falseDataPenaltiesApplied = 0;

    const adversaries = participants.filter(p => p.role === 'ADVERSARY');
    const attacker = adversaries[0] || participants[0];

    const claimedEnergy = 10.0;
    const actualCapacity = 4.0;
    const attractivePrice = Number((basePricePerKwh * 0.90).toFixed(4));

    falseDataClaimsKwh = claimedEnergy;
    actualDeliveredKwh = actualCapacity;
    this.claimedVsActual.set(attacker.id, { claimed: claimedEnergy, actual: actualCapacity });

    if (policies.oracleVerificationEnabled) {
      oracleVerificationRate = 94.5;
      dataIntegrityViolationRate = 60.0;
      const verifiedEnergy = actualCapacity;
      falseDataPenaltiesApplied = 1;

      const salt = CryptoPrivacyService.generateSalt();
      injectedOrders.push({
        id: `ORD_FALSEDATA_CAPPED_${attacker.id}_${currentEpoch}`,
        participantId: attacker.id,
        type: 'SELL',
        energyKwh: verifiedEnergy,
        pricePerKwh: attractivePrice,
        commitmentHash: CryptoPrivacyService.hash(`FALSEDATA:${attacker.id}:${verifiedEnergy}:${salt}`),
        salt,
        isRevealed: true,
        status: 'ACTIVE',
        remainingEnergyKwh: verifiedEnergy,
        gridNodeId: attacker.gridNodeId,
        reputationAtSubmission: attacker.reputation.score * 0.6,
        timestamp: Date.now(),
      });
    } else {
      oracleVerificationRate = 0;
      dataIntegrityViolationRate = 60.0;

      const salt = CryptoPrivacyService.generateSalt();
      injectedOrders.push({
        id: `ORD_FALSEDATA_${attacker.id}_${currentEpoch}`,
        participantId: attacker.id,
        type: 'SELL',
        energyKwh: claimedEnergy,
        pricePerKwh: attractivePrice,
        commitmentHash: CryptoPrivacyService.hash(`FALSEDATA:${attacker.id}:${claimedEnergy}:${salt}`),
        salt,
        isRevealed: true,
        status: 'ACTIVE',
        remainingEnergyKwh: claimedEnergy,
        gridNodeId: attacker.gridNodeId,
        reputationAtSubmission: attacker.reputation.score,
        timestamp: Date.now(),
      });

      if (adversaries.length > 1) {
        const attacker2 = adversaries[1];
        const claimed2 = 8.0;
        const actual2 = 3.0;
        falseDataClaimsKwh += claimed2;
        actualDeliveredKwh += actual2;
        this.claimedVsActual.set(attacker2.id, { claimed: claimed2, actual: actual2 });

        const salt2 = CryptoPrivacyService.generateSalt();
        injectedOrders.push({
          id: `ORD_FALSEDATA_${attacker2.id}_${currentEpoch}`,
          participantId: attacker2.id,
          type: 'SELL',
          energyKwh: claimed2,
          pricePerKwh: Number((basePricePerKwh * 0.88).toFixed(4)),
          commitmentHash: CryptoPrivacyService.hash(`FALSEDATA:${attacker2.id}:${claimed2}:${salt2}`),
          salt: salt2,
          isRevealed: true,
          status: 'ACTIVE',
          remainingEnergyKwh: claimed2,
          gridNodeId: attacker2.gridNodeId,
          reputationAtSubmission: attacker2.reputation.score,
          timestamp: Date.now(),
        });
      }
    }

    return {
      injectedOrders,
      metrics: {
        falseDataClaimsKwh: Number(falseDataClaimsKwh.toFixed(2)),
        actualDeliveredKwh: Number(actualDeliveredKwh.toFixed(2)),
        dataIntegrityViolationRate: Number(dataIntegrityViolationRate.toFixed(1)),
        oracleVerificationRate: Number(oracleVerificationRate.toFixed(1)),
        falseDataPenaltiesApplied,
      },
    };
  }

  /**
   * Problem 3: FAKE RATINGS & BALLOT STUFFING
   * One real participant creates puppet accounts (A1-A4) that all rate the attacker highly.
   * Fake bids, votes and interactions inflate influence and reputation.
   */
  public injectFakeRatingBallotStuffing(
    participants: Participant[],
    basePricePerKwh: number,
    policies: SystemFairnessPolicies,
    currentEpoch: number
  ): { injectedOrders: Order[]; metrics: Partial<ReputationManipulationMetrics> } {
    const injectedOrders: Order[] = [];
    let fakeRatingInjectionCount = 0;
    let ballotStuffingVoteCount = 0;
    let reputationInflationPct = 0;
    let defenseBlockedFakeRatings = 0;
    let defenseBlockedBallotStuffs = 0;

    const adversaries = participants.filter(p => p.role === 'ADVERSARY');
    const masterAttacker = adversaries[0] || participants[0];

    const puppetCount = 4;
    const fakeRatingsPerPuppet = 5;
    const totalFakeRatings = puppetCount * fakeRatingsPerPuppet;

    if (policies.antiBallotStuffingEnabled) {
      const blockedRate = 0.88;
      defenseBlockedFakeRatings = Math.floor(totalFakeRatings * blockedRate);
      defenseBlockedBallotStuffs = Math.floor(puppetCount * blockedRate);
      fakeRatingInjectionCount = totalFakeRatings - defenseBlockedFakeRatings;
      ballotStuffingVoteCount = puppetCount - defenseBlockedBallotStuffs;
      reputationInflationPct = 2.5;

      const salt = CryptoPrivacyService.generateSalt();
      injectedOrders.push({
        id: `ORD_BALLOT_CAPPED_${masterAttacker.id}_${currentEpoch}`,
        participantId: masterAttacker.id,
        type: 'SELL',
        energyKwh: 1.5,
        pricePerKwh: Number((basePricePerKwh * 0.95).toFixed(4)),
        commitmentHash: CryptoPrivacyService.hash(`BALLOT:${masterAttacker.id}:1.5:${salt}`),
        salt,
        isRevealed: true,
        status: 'ACTIVE',
        remainingEnergyKwh: 1.5,
        gridNodeId: masterAttacker.gridNodeId,
        reputationAtSubmission: masterAttacker.reputation.score * 0.5,
        timestamp: Date.now(),
      });
    } else {
      fakeRatingInjectionCount = totalFakeRatings;
      ballotStuffingVoteCount = puppetCount * fakeRatingsPerPuppet;
      reputationInflationPct = 68.0;

      for (let i = 0; i < puppetCount; i++) {
        const puppetId = `PUPPET_${masterAttacker.id}_A${i + 1}`;
        for (let r = 0; r < fakeRatingsPerPuppet; r++) {
          this.fakeRatingsLog.push({
            from: puppetId,
            to: masterAttacker.id,
            rating: 4.5 + Math.random() * 0.5,
            isFake: true,
            blocked: false,
          });
        }
      }

      for (let i = 0; i < puppetCount; i++) {
        const puppetId = `PUPPET_${masterAttacker.id}_A${i + 1}`;
        const puppetEnergy = 2.0 + Math.random() * 1.5;

        const salt = CryptoPrivacyService.generateSalt();
        injectedOrders.push({
          id: `ORD_BALLOT_${puppetId}_${currentEpoch}`,
          participantId: puppetId,
          type: 'SELL',
          energyKwh: Number(puppetEnergy.toFixed(2)),
          pricePerKwh: Number((basePricePerKwh * (0.90 + Math.random() * 0.08)).toFixed(4)),
          commitmentHash: CryptoPrivacyService.hash(`BALLOT:${puppetId}:${puppetEnergy}:${salt}`),
          salt,
          isRevealed: true,
          status: 'ACTIVE',
          remainingEnergyKwh: Number(puppetEnergy.toFixed(2)),
          gridNodeId: masterAttacker.gridNodeId,
          reputationAtSubmission: 0.85,
          timestamp: Date.now(),
        });
      }
    }

    return {
      injectedOrders,
      metrics: {
        fakeRatingInjectionCount,
        ballotStuffingVoteCount,
        reputationInflationPct: Number(reputationInflationPct.toFixed(1)),
        defenseBlockedFakeRatings,
        defenseBlockedBallotStuffs,
      },
    };
  }

  public getClaimedVsActual(participantId: string): { claimed: number; actual: number } | undefined {
    return this.claimedVsActual.get(participantId);
  }

  public getFakeRatingsLog() {
    return this.fakeRatingsLog;
  }

  public resetEpoch(): void {
    this.claimedVsActual.clear();
    this.fakeRatingsLog = [];
  }
}
