/**
 * Sybil Attack Solution Engine for SG2.0
 * Directly implements the 5 essential pillars from Slide 08:
 * "Needed: registration • authentication • staking • Sybil resistance • robust reputation"
 *
 * Evaluates both:
 * 1. IDENTITY TRUST: Is the participant unique and real?
 * 2. REPUTATION TRUST: Does the score reflect true behavior?
 */

import { Participant, SybilDefensePipeline, SybilDefenseStatus, Order } from './types';
import { CryptoPrivacyService } from './cryptoPrivacy';

export interface PuppetAttemptResult {
  puppetId: string;
  gridNodeId: string;
  layer1DIDRegistration: boolean;
  layer2Authentication: boolean;
  layer3StakingPaid: boolean;
  layer4PhysicalMeterAttested: boolean;
  layer5ReputationDiscounted: boolean;
  isBlocked: boolean;
  blockedReason: string;
}

export class SybilDefenseEngine {
  // Registry of authenticated hardware smart meter NMIs
  private registeredPhysicalMeters: Map<string, string> = new Map(); // NMI -> ParticipantID
  // Staked collateral deposits ($)
  private stakedCollateralPool: Map<string, number> = new Map();

  /**
   * Evaluates the 5-layer Sybil defense pipeline against an attacker attempting
   * to spawn puppet accounts (A1, A2, A3, A4) from one real participant.
   */
  public evaluateSybilDefense(
    pipeline: SybilDefensePipeline,
    masterAttacker: Participant,
    puppetsCount: number = 4
  ): {
    status: SybilDefenseStatus;
    puppetResults: PuppetAttemptResult[];
    injectedPuppetOrders: Order[];
  } {
    const puppetResults: PuppetAttemptResult[] = [];
    let puppetsBlockedCount = 0;
    let economicCostToAttacker = 0;
    const injectedPuppetOrders: Order[] = [];

    // Master attacker register their genuine meter first
    const masterMeterNMI = `NMI_${masterAttacker.gridNodeId}_GENUINE_001`;
    this.registeredPhysicalMeters.set(masterMeterNMI, masterAttacker.id);

    for (let i = 1; i <= puppetsCount; i++) {
      const puppetId = `PUPPET_${masterAttacker.id}_A${i}`;
      let isBlocked = false;
      let blockedReason = 'All 5 Defense Layers Passed (Vulnerable mode)';

      // 1. REGISTRATION (Decentralized Identity Verification)
      // Puppets are generated virtually; they lack an accredited PKI-backed DID document
      const layer1Pass = !pipeline.didRegistrationEnabled ? true : false;
      if (!layer1Pass && !isBlocked) {
        isBlocked = true;
        blockedReason = 'Layer 1: Blocked by DID Registration — Missing accredited DID certificate';
      }

      // 2. AUTHENTICATION (Smart Meter Hardware Challenge-Response)
      // Puppets do not have a dedicated cryptographic hardware TPM/Secure Element
      const layer2Pass = !pipeline.meterHardwareAuthEnabled ? true : false;
      if (!layer2Pass && !isBlocked) {
        isBlocked = true;
        blockedReason = 'Layer 2: Blocked by Authentication — Inverter/Meter ECDSA signature verification failed';
      }

      // 3. STAKING (Economic Barrier to Puppet Generation)
      // Requiring financial collateral forces the attacker to commit real capital ($150 per puppet)
      const stakeRequired = pipeline.economicStakingRequired ? pipeline.stakeAmountPerIdentity : 0;
      economicCostToAttacker += stakeRequired;
      const layer3Pass = !pipeline.economicStakingRequired ? true : masterAttacker.balance >= economicCostToAttacker;
      if (!layer3Pass && !isBlocked) {
        isBlocked = true;
        blockedReason = `Layer 3: Blocked by Staking — Insufficient wallet collateral ($${economicCostToAttacker} required)`;
      }

      // 4. SYBIL RESISTANCE (Proof-of-Physical-Asset / Unique Meter Binding)
      // Checks whether puppet tries to claim the same physical grid connection bus as Master
      const puppetClaimedNMI = masterMeterNMI; // Attacker has only 1 physical meter
      const isDuplicateMeter = this.registeredPhysicalMeters.has(puppetClaimedNMI);
      const layer4Pass = !pipeline.proofOfPhysicalAssetEnabled ? true : !isDuplicateMeter;
      if (!layer4Pass && !isBlocked) {
        isBlocked = true;
        blockedReason = `Layer 4: Blocked by Sybil Resistance — Physical Meter ${puppetClaimedNMI} already bound to ${masterAttacker.id}`;
      }

      // 5. ROBUST REPUTATION (Bayesian Endorsement Cycle Pruning)
      // If puppet somehow submitted bids or votes, diminish endorsement weight logarithmically
      const layer5Discount = pipeline.bayesianAntiBallotEnabled;

      if (isBlocked) {
        puppetsBlockedCount++;
      } else {
        // Puppet managed to enter the order book
        const salt = CryptoPrivacyService.generateSalt();
        injectedPuppetOrders.push({
          id: `ORD_SYBIL_${puppetId}`,
          participantId: puppetId,
          type: 'SELL',
          energyKwh: 2.0,
          pricePerKwh: 0.18,
          commitmentHash: CryptoPrivacyService.hash(`SYBIL:${puppetId}:2.0:${salt}`),
          salt,
          isRevealed: true,
          status: 'ACTIVE',
          remainingEnergyKwh: 2.0,
          gridNodeId: masterAttacker.gridNodeId,
          reputationAtSubmission: layer5Discount ? 0.35 : 0.88,
          timestamp: Date.now(),
        });
      }

      puppetResults.push({
        puppetId,
        gridNodeId: masterAttacker.gridNodeId,
        layer1DIDRegistration: layer1Pass,
        layer2Authentication: layer2Pass,
        layer3StakingPaid: layer3Pass,
        layer4PhysicalMeterAttested: layer4Pass,
        layer5ReputationDiscounted: layer5Discount,
        isBlocked,
        blockedReason,
      });
    }

    const anyDefenseActive =
      pipeline.didRegistrationEnabled ||
      pipeline.meterHardwareAuthEnabled ||
      pipeline.economicStakingRequired ||
      pipeline.proofOfPhysicalAssetEnabled ||
      pipeline.bayesianAntiBallotEnabled;

    const overallSybilDefended = puppetsBlockedCount === puppetsCount;
    const attackerSuccessProbability = overallSybilDefended
      ? 1.5
      : Number(((1 - puppetsBlockedCount / puppetsCount) * 88.0).toFixed(1));

    const status: SybilDefenseStatus = {
      layer1RegistrationResult: pipeline.didRegistrationEnabled ? 'BLOCKED_MISSING_DID' : 'PASSED',
      layer2AuthenticationResult: pipeline.meterHardwareAuthEnabled ? 'BLOCKED_INVALID_METER_SIG' : 'PASSED',
      layer3StakingResult: pipeline.economicStakingRequired ? 'BLOCKED_INSUFFICIENT_COLLATERAL' : 'PASSED',
      layer4SybilResistanceResult: pipeline.proofOfPhysicalAssetEnabled ? 'BLOCKED_DUPLICATE_METER_NMI' : 'PASSED',
      layer5RobustReputationResult: pipeline.bayesianAntiBallotEnabled ? 'BALLOT_STUFFING_DISCOUNTED' : 'PASSED',
      puppetsBlockedCount,
      economicCostToAttacker,
      attackerSuccessProbability,
      overallSybilDefended: anyDefenseActive && overallSybilDefended,
    };

    return {
      status,
      puppetResults,
      injectedPuppetOrders,
    };
  }
}
