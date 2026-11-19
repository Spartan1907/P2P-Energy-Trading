/**
 * Master Simulation Runner for SG2.0 P2P Transactive Microgrid
 * Coordinates participants, physical generation/load curves, battery dispatch,
 * market clearing, blockchain ledger, attacks, and fairness auditing.
 */

import {
  Participant,
  SimulationState,
  SystemFairnessPolicies,
  AttackType,
  Order,
  TradeMatch,
} from './types';
import { DistributionGridModel } from './gridModel';
import { SmartContractLedger } from './blockchain';
import { TransactiveMarketEngine } from './marketEngine';
import { ReputationEngine } from './reputationEngine';
import { AdversaryEngine } from './adversaryEngine';
import { FalseDataEngine } from './falseDataEngine';
import { SybilDefenseEngine } from './sybilDefenseEngine';
import { FairnessEngine } from './fairnessEngine';
import { CryptoPrivacyService } from './cryptoPrivacy';

export class SimulationRunner {
  private state: SimulationState;
  private gridModel: DistributionGridModel;
  private ledger: SmartContractLedger;
  private marketEngine: TransactiveMarketEngine;
  private reputationEngine: ReputationEngine;
  private adversaryEngine: AdversaryEngine;
  private falseDataEngine: FalseDataEngine;
  private sybilDefenseEngine: SybilDefenseEngine;
  private fairnessEngine: FairnessEngine;

  constructor(participantCount: number = 24) {
    this.gridModel = new DistributionGridModel();
    this.ledger = new SmartContractLedger();
    this.marketEngine = new TransactiveMarketEngine();
    this.reputationEngine = new ReputationEngine();
    this.adversaryEngine = new AdversaryEngine();
    this.falseDataEngine = new FalseDataEngine();
    this.sybilDefenseEngine = new SybilDefenseEngine();
    this.fairnessEngine = new FairnessEngine();

    const defaultPolicies: SystemFairnessPolicies = {
      lifelineQuotaEnabled: false,
      lifelineQuotaKwh: 2.0,
      lifelineDiscountRate: 0.25,
      congestionSocializationEnabled: false,
      weatherForgivenessEnabled: false,
      dynamicStakingEnabled: false,
      sybilProofOfAssetEnabled: false,
      antiWashCycleDetectionEnabled: false,
      oracleVerificationEnabled: false,
      antiBallotStuffingEnabled: false,
      sybilDefensePipeline: {
        didRegistrationEnabled: false,
        meterHardwareAuthEnabled: false,
        economicStakingRequired: false,
        stakeAmountPerIdentity: 150,
        proofOfPhysicalAssetEnabled: false,
        bayesianAntiBallotEnabled: false,
      },
    };

    const initialParticipants = this.generateRealisticParticipants(participantCount);

    this.state = {
      epoch: 1,
      hour: 12, // Start at midday solar peak
      isRunning: false,
      speedMs: 1200,
      participants: initialParticipants,
      gridNodes: this.gridModel.getAllNodes(),
      activeOrders: [],
      recentMatches: [],
      blockchain: this.ledger.getChain(),
      pendingMempool: [],
      marketMetrics: {
        epoch: 1,
        timeOfDayHour: 12,
        totalGenerationKw: 0,
        totalDemandKw: 0,
        supplyDemandRatio: 1.0,
        marketBasePricePerKwh: 0.20,
        averageClearedPricePerKwh: 0.20,
        gridRetailPricePerKwh: 0.32,
        feedInTariffPerKwh: 0.08,
        totalTradedKwh: 0,
        unmetDemandKwh: 0,
        curtailedSupplyKwh: 0,
        transactionSuccessRate: 100,
        marketEfficiency: 95.0,
        congestionEventsCount: 0,
      },
      fairnessMetrics: {
        jainsFairnessIndex: 0.72,
        giniCoefficient: 0.38,
        socialWelfareTotal: 15.0,
        tier1Utility: 2.8,
        tier2Utility: 1.2,
        tier3Utility: 0.25,
        wealthDivideRatio: 11.2,
        edgeToSubstationPriceRatio: 1.24,
        coldStartEscapeRate: 35.0,
        weatherShockFalsePenaltyCount: 0,
        congestionBurdenEdgeShare: 68.0,
      },
      attackMetrics: {
        attackType: 'NONE',
        isActive: false,
        attackerProfitAdvantagePct: 0,
        cartelPriceInflationPct: 0,
        sybilMarketSharePct: 0,
        washTradingVolumePct: 0,
        phantomEnergyDefaultRate: 0,
        defenseEffectivenessScore: 100,
      },
      reputationManipulationMetrics: {
        fakeRatingInjectionCount: 0,
        ballotStuffingVoteCount: 0,
        reputationInflationPct: 0,
        falseDataClaimsKwh: 0,
        actualDeliveredKwh: 0,
        dataIntegrityViolationRate: 0,
        oracleVerificationRate: 0,
        defenseBlockedFakeRatings: 0,
        defenseBlockedBallotStuffs: 0,
        falseDataPenaltiesApplied: 0,
      },
      sybilDefenseStatus: {
        layer1RegistrationResult: 'PASSED',
        layer2AuthenticationResult: 'PASSED',
        layer3StakingResult: 'PASSED',
        layer4SybilResistanceResult: 'PASSED',
        layer5RobustReputationResult: 'PASSED',
        puppetsBlockedCount: 0,
        economicCostToAttacker: 0,
        attackerSuccessProbability: 88.0,
        overallSybilDefended: false,
      },
      fairnessPolicies: defaultPolicies,
      activeAttack: 'NONE',
      solarIrradiancePu: 0.95,
      weatherCondition: 'SUNNY',
    };

    // Register all participants on blockchain
    for (const p of this.state.participants) {
      this.ledger.registerParticipant(p, false);
    }
  }

  public getState(): SimulationState {
    return this.state;
  }

  public setFairnessPolicies(policies: Partial<SystemFairnessPolicies>): void {
    this.state.fairnessPolicies = { ...this.state.fairnessPolicies, ...policies };
  }

  public setActiveAttack(attack: AttackType): void {
    this.state.activeAttack = attack;
  }

  public setWeatherCondition(weather: 'SUNNY' | 'PARTLY_CLOUDY' | 'HEAVY_STORM'): void {
    this.state.weatherCondition = weather;
  }

  /**
   * Generates heterogeneous participants spanning the 3 socioeconomic wealth tiers
   */
  public generateRealisticParticipants(count: number): Participant[] {
    const list: Participant[] = [];
    const nodes = this.gridModel.getAllNodes();

    for (let i = 1; i <= count; i++) {
      const node = nodes[(i - 1) % nodes.length];
      let role: Participant['role'];
      let wealthTier: 1 | 2 | 3;
      let pvCap = 0;
      let batCap = 0;
      let batMax = 0;
      let baseDemand = 1.2 + ((i * 7) % 15) * 0.15; // 1.2 - 3.4 kW
      let attackType: AttackType | undefined;

      if (i <= 2) {
        // Designated adversaries for sandbox testing
        role = 'ADVERSARY';
        wealthTier = 1;
        pvCap = 12.0;
        batCap = 18.0;
        batMax = 5.0;
        attackType = 'SELLER_CARTEL';
      } else if (i <= Math.floor(count * 0.35)) {
        // Tier 1: Green Elite Prosumer
        role = 'PROSUMER_ELITE';
        wealthTier = 1;
        pvCap = 10.0 + ((i * 3) % 6);
        batCap = 15.0 + ((i * 2) % 6);
        batMax = 4.5;
      } else if (i <= Math.floor(count * 0.7)) {
        // Tier 2: Standard Prosumer
        role = 'PROSUMER_STANDARD';
        wealthTier = 2;
        pvCap = 3.5 + ((i * 5) % 4);
        batCap = 0;
        batMax = 0;
      } else {
        // Tier 3: Vulnerable Pure Consumer
        role = 'CONSUMER_VULNERABLE';
        wealthTier = 3;
        pvCap = 0;
        batCap = 0;
        batMax = 0;
      }

      list.push({
        id: `node_user_${i}`,
        name: `${role === 'PROSUMER_ELITE' ? 'Elite Prosumer' : role === 'PROSUMER_STANDARD' ? 'Solar Home' : role === 'ADVERSARY' ? 'Strategic Actor' : 'Vulnerable Tenant'} #${i}`,
        role,
        gridNodeId: node.id,
        wealthTier,
        pvCapacityKw: pvCap,
        batteryCapacityKwh: batCap,
        batterySoC: batCap > 0 ? 0.6 : 0,
        batteryMaxPowerKw: batMax,
        baselineDemandKw: Number(baseDemand.toFixed(2)),
        currentGenerationKw: 0,
        netDemandKw: 0,
        balance: wealthTier === 1 ? 500 : wealthTier === 2 ? 150 : 40,
        lockedEscrow: 0,
        reputation: this.reputationEngine.createInitialScore(wealthTier === 3),
        attackType,
      });
    }

    return list;
  }

  /**
   * Advances simulation by 1 hourly time step (epoch)
   */
  public step(): SimulationState {
    const nextEpoch = this.state.epoch + 1;
    const nextHour = nextEpoch % 24;

    // 1. Calculate Solar Irradiance based on hour and weather
    let rawSolar = 0;
    if (nextHour >= 6 && nextHour <= 18) {
      // Bell curve peaking at hour 12
      rawSolar = Math.sin(((nextHour - 6) / 12) * Math.PI);
    }

    let weatherMultiplier = 1.0;
    if (this.state.weatherCondition === 'PARTLY_CLOUDY') weatherMultiplier = 0.55;
    if (this.state.weatherCondition === 'HEAVY_STORM') weatherMultiplier = 0.15;

    const currentSolarPu = Number((rawSolar * weatherMultiplier).toFixed(3));
    this.state.solarIrradiancePu = currentSolarPu;
    this.state.hour = nextHour;
    this.state.epoch = nextEpoch;

    // 2. Update participant physical net energy states
    const ordersToSubmit: Order[] = [];
    const nodalInjections = new Map<string, number>();

    for (const p of this.state.participants) {
      // Dynamic demand curve (morning peak hour 8, evening peak hour 19)
      let hourFactor = 1.0;
      if ((nextHour >= 7 && nextHour <= 9) || (nextHour >= 18 && nextHour <= 21)) {
        hourFactor = 1.45;
      } else if (nextHour >= 1 && nextHour <= 5) {
        hourFactor = 0.65;
      }

      const demand = Number((p.baselineDemandKw * hourFactor).toFixed(2));
      let generation = Number((p.pvCapacityKw * currentSolarPu).toFixed(2));

      // Battery storage dispatch logic for Tier 1
      if (p.batteryCapacityKwh > 0) {
        if (currentSolarPu > 0.6 && p.batterySoC < 0.95) {
          // Charge battery from excess solar
          const chargeKw = Math.min(p.batteryMaxPowerKw, generation * 0.4);
          generation -= chargeKw;
          p.batterySoC = Math.min(1.0, p.batterySoC + chargeKw / p.batteryCapacityKwh);
        } else if (nextHour >= 18 && nextHour <= 22 && p.batterySoC > 0.2) {
          // Discharge battery during evening peak
          const dischargeKw = Math.min(p.batteryMaxPowerKw, (p.batterySoC - 0.2) * p.batteryCapacityKwh);
          generation += dischargeKw;
          p.batterySoC = Math.max(0.15, p.batterySoC - dischargeKw / p.batteryCapacityKwh);
        }
      }

      p.currentGenerationKw = generation;
      const net = Number((demand - generation).toFixed(2));
      p.netDemandKw = net;

      // Track nodal injection for power flow physics (positive = export, negative = import)
      const currentNetNode = nodalInjections.get(p.gridNodeId) || 0;
      nodalInjections.set(p.gridNodeId, currentNetNode - net);

      // Create Order
      if (Math.abs(net) > 0.1) {
        const orderType = net > 0 ? 'BUY' : 'SELL';
        const energyKwh = Math.abs(net);

        // Price bidding strategy
        let bidPrice: number;
        if (orderType === 'BUY') {
          bidPrice = Number((0.32 - (p.wealthTier === 3 ? 0.08 : 0.03)).toFixed(4));
        } else {
          bidPrice = Number((0.08 + (p.wealthTier === 1 ? 0.05 : 0.03)).toFixed(4));
        }

        const salt = CryptoPrivacyService.generateSalt();
        const { commitmentHash } = CryptoPrivacyService.createOrderCommitment(
          p.id,
          orderType,
          bidPrice,
          energyKwh,
          salt
        );

        // Required collateral escrow
        const requiredBond = this.reputationEngine.calculateRequiredCollateral(
          p.reputation.score,
          energyKwh,
          0.20,
          this.state.fairnessPolicies.dynamicStakingEnabled
        );
        p.lockedEscrow = requiredBond;

        ordersToSubmit.push({
          id: `ORD_${p.id}_${nextEpoch}`,
          participantId: p.id,
          type: orderType,
          energyKwh,
          pricePerKwh: bidPrice,
          commitmentHash,
          salt,
          isRevealed: true,
          status: 'ACTIVE',
          remainingEnergyKwh: energyKwh,
          gridNodeId: p.gridNodeId,
          reputationAtSubmission: p.reputation.score,
          timestamp: Date.now(),
        });
      }
    }

    // 3. Ingest Adversarial Orders (if attack is selected)
    const { injectedOrders, metrics: attackMetrics } = this.adversaryEngine.injectAdversarialOrders(
      this.state.participants,
      this.state.activeAttack,
      this.state.marketMetrics.marketBasePricePerKwh,
      this.state.fairnessPolicies,
      nextEpoch
    );

    const allOrders = [...ordersToSubmit, ...injectedOrders];
    this.state.activeOrders = allOrders;
    this.state.attackMetrics = attackMetrics;

    // 3b. Inject False Data / Reputation Manipulation attacks
    if (this.state.activeAttack === 'FALSE_DATA_ORACLE') {
      this.falseDataEngine.resetEpoch();
      const { injectedOrders: falseDataOrders, metrics: fdMetrics } = this.falseDataEngine.injectFalseDataOrders(
        this.state.participants,
        this.state.marketMetrics.marketBasePricePerKwh,
        this.state.fairnessPolicies,
        nextEpoch
      );
      allOrders.push(...falseDataOrders);
      this.state.activeOrders = allOrders;
      this.state.reputationManipulationMetrics = {
        ...this.state.reputationManipulationMetrics,
        ...fdMetrics,
      };
    } else if (this.state.activeAttack === 'FAKE_RATING_BALLOT') {
      this.falseDataEngine.resetEpoch();
      const { injectedOrders: ballotOrders, metrics: brMetrics } = this.falseDataEngine.injectFakeRatingBallotStuffing(
        this.state.participants,
        this.state.marketMetrics.marketBasePricePerKwh,
        this.state.fairnessPolicies,
        nextEpoch
      );
      allOrders.push(...ballotOrders);
      this.state.activeOrders = allOrders;
      this.state.reputationManipulationMetrics = {
        ...this.state.reputationManipulationMetrics,
        ...brMetrics,
      };
    } else {
      this.state.reputationManipulationMetrics = {
        fakeRatingInjectionCount: 0,
        ballotStuffingVoteCount: 0,
        reputationInflationPct: 0,
        falseDataClaimsKwh: 0,
        actualDeliveredKwh: 0,
        dataIntegrityViolationRate: 0,
        oracleVerificationRate: 0,
        defenseBlockedFakeRatings: 0,
        defenseBlockedBallotStuffs: 0,
        falseDataPenaltiesApplied: 0,
      };
    }

    // 3c. Evaluate 5-Pillar Sybil Defense Pipeline (Slide 08: registration, authentication, staking, sybil resistance, robust reputation)
    const adversaries = this.state.participants.filter((p) => p.role === 'ADVERSARY');
    const master = adversaries[0] || this.state.participants[0];
    const { status: sybilStatus, injectedPuppetOrders } = this.sybilDefenseEngine.evaluateSybilDefense(
      this.state.fairnessPolicies.sybilDefensePipeline,
      master,
      4
    );
    this.state.sybilDefenseStatus = sybilStatus;
    if (this.state.activeAttack === 'SYBIL' && !sybilStatus.overallSybilDefended) {
      allOrders.push(...injectedPuppetOrders);
      this.state.activeOrders = allOrders;
    }

    // 4. Update Grid Feeder Power Flows & Thermal Limits
    this.gridModel.calculatePowerFlows(nodalInjections);
    this.state.gridNodes = this.gridModel.getAllNodes();

    // 5. Execute Double Auction Market Clearing
    const participantsMap = new Map(this.state.participants.map((p) => [p.id, p]));
    const { matches, metrics: marketMetrics } = this.marketEngine.executeMarketClearing(
      allOrders,
      participantsMap,
      this.gridModel,
      this.state.fairnessPolicies,
      nextEpoch
    );

    this.state.recentMatches = matches;
    this.state.marketMetrics = marketMetrics;

    // 6. Settle Trades on Blockchain & Update Reputation
    const weatherShockExempt =
      this.state.fairnessPolicies.weatherForgivenessEnabled && this.state.weatherCondition !== 'SUNNY';

    for (const match of matches) {
      this.ledger.logTradeSettlement(match);

      const seller = participantsMap.get(match.sellerId);
      const buyer = participantsMap.get(match.buyerId);

      if (seller) {
        // Handle delivery: check if phantom attacker defaulted
        if (seller.attackType === 'PHANTOM_ENERGY') {
          match.status = 'DEFAULTED_BY_SELLER';
          match.deliveredEnergyKwh = 0;
          this.ledger.logEscrowSlash(seller.id, match.buyerId, seller.lockedEscrow, 'Non-delivery of phantom energy');
          const { updatedScore } = this.reputationEngine.recordDefaultedTrade(
            seller.reputation,
            match.energyKwh,
            nextEpoch,
            false
          );
          seller.reputation = updatedScore;
        } else {
          match.status = 'SETTLED';
          seller.balance += match.grossAmount;
          const updatedScore = this.reputationEngine.recordSuccessfulTrade(
            seller.reputation,
            match.energyKwh,
            match.buyerId,
            seller.id,
            nextEpoch
          );
          seller.reputation = updatedScore;
        }
      }

      if (buyer && match.status === 'SETTLED') {
        buyer.balance -= match.grossAmount;
      }
    }

    // Apply periodic time-decay aging to prevent trust hoarding
    if (nextEpoch % 6 === 0) {
      for (const p of this.state.participants) {
        p.reputation = this.reputationEngine.applyEpochTimeDecay(p.reputation, nextEpoch);
      }
    }

    // 7. Mine Block
    this.ledger.mineBlock('0xLEADER_NODE');
    this.state.blockchain = [...this.ledger.getChain()];

    // 8. Fairness & Energy Justice Evaluation
    this.state.fairnessMetrics = this.fairnessEngine.evaluateFairness(
      this.state.participants,
      matches,
      this.state.gridNodes,
      this.state.fairnessPolicies,
      this.state.weatherCondition
    );

    return this.state;
  }
}
