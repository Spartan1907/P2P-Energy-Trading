/**
 * IIIT Allahabad Framework — Experimental Setup & Evaluation Engine
 * Directly implements Slide 12 (Scenarios A to E) & Slide 13 (8 Evaluation Metrics & 3 Planned Comparisons)
 * Authors: Krish (IIT2024120), Chahat Kumar (IIT2024201), Kush Singhania (IIT2024199)
 */

import {
  IiitScenarioType,
  IiitEvaluationMetrics,
  Order,
  Participant,
  MeterValidationRecord,
  SmartContractTradeRecord,
} from './types';
import { TransactiveMarketEngine } from './marketEngine';
import { ReputationEngine } from './reputationEngine';
import { SmartContractLedger } from './blockchain';
import { DistributionGridModel } from './gridModel';

export class IiitExperimentRunner {
  private marketEngine = new TransactiveMarketEngine();
  private reputationEngine = new ReputationEngine();
  private gridModel = new DistributionGridModel();

  /**
   * Generates synthetic prosumer and consumer participant profiles
   */
  public generateParticipants(count: number): Participant[] {
    const list: Participant[] = [];
    for (let i = 1; i <= count; i++) {
      const isSeller = i % 2 === 1;
      const wealthTier = (i % 3 + 1) as 1 | 2 | 3;
      const pvCap = isSeller ? (wealthTier === 1 ? 12 : 5) : 0;
      const batCap = isSeller && wealthTier === 1 ? 15 : 0;
      const baselineDemand = isSeller ? 2.5 : wealthTier === 3 ? 3.0 : 4.5;
      const gen = isSeller ? (wealthTier === 1 ? 10.0 : 4.0) : 0.0;

      list.push({
        id: `node_${i}`,
        name: isSeller ? `Prosumer Node ${i}` : `Consumer Node ${i}`,
        role: isSeller ? (wealthTier === 1 ? 'PROSUMER_ELITE' : 'PROSUMER_STANDARD') : 'CONSUMER_VULNERABLE',
        gridNodeId: `Bus-${(i % 14) + 1}`,
        wealthTier,
        pvCapacityKw: pvCap,
        batteryCapacityKwh: batCap,
        batterySoC: 0.6,
        batteryMaxPowerKw: batCap * 0.5,
        baselineDemandKw: baselineDemand,
        currentGenerationKw: gen,
        netDemandKw: baselineDemand - gen,
        balance: 600,
        lockedEscrow: 0,
        reputation: {
          alpha: 10,
          beta: 2,
          score: 0.82,
          totalTrades: 12,
          fulfilledKwh: 40,
          defaultedKwh: 0,
          consecutiveDefaults: 0,
          lastUpdatedEpoch: 1,
        },
      });
    }
    return list;
  }

  /**
   * Executes one full evaluation experiment across Slide 12 & 13 parameters
   */
  public runExperiment(params: {
    participantCount: 10 | 25 | 50;
    scenario: IiitScenarioType;
    matchingMode: 'GREEDY_PRICE_PRIORITY' | 'TWO_STAGE_PROPORTIONAL_FAIR';
    reputationEnabled: boolean;
  }): {
    metrics: IiitEvaluationMetrics;
    validationLogs: MeterValidationRecord[];
    smartContractTrades: SmartContractTradeRecord[];
    allocationsByConsumer: { id: string; demand: number; allocated: number; satisfaction: number }[];
  } {
    const startTime = performance.now();
    const ledger = new SmartContractLedger();
    const participants = this.generateParticipants(params.participantCount);

    const validationLogs: MeterValidationRecord[] = [];
    const buyOrders: Order[] = [];
    const sellOrders: Order[] = [];

    let injectedInvalidCount = 0;
    let detectedInvalidCount = 0;

    // 1. Participant Registration on Blockchain
    participants.forEach((p) => {
      ledger.registerParticipant(p, true);
    });

    // 2. Generate and Validate Offers / Bids per Scenario
    participants.forEach((p, idx) => {
      if (p.currentGenerationKw > p.baselineDemandKw) {
        // Seller
        const trueSurplus = Math.max(0, p.currentGenerationKw - p.baselineDemandKw);
        let claimedKwh = trueSurplus;
        let askPrice = 0.12;

        if (params.scenario === 'SCENARIO_B_FALSE_REPORTING' && idx === 0) {
          // Exaggerated energy claim (Slide 07: 10 claimed vs 4 verified)
          claimedKwh = trueSurplus + 6.0;
          injectedInvalidCount++;
        }

        if (params.scenario === 'SCENARIO_E_STRATEGIC_BIDDING') {
          // Gouging ask price
          askPrice = 0.38;
        }

        // Module 1 Validation: S_i,t = max(0, G - C - R), A_i,t = min(O, S)
        const val = this.marketEngine.validateSellerSurplus(
          p.id,
          claimedKwh,
          p.currentGenerationKw,
          p.baselineDemandKw,
          0,
          0.05
        );
        validationLogs.push(val);

        if (val.decision === 'REJECTED') {
          detectedInvalidCount++;
        } else {
          sellOrders.push({
            id: `SELL_${p.id}`,
            participantId: p.id,
            type: 'SELL',
            energyKwh: val.acceptedOfferKwh,
            remainingEnergyKwh: val.acceptedOfferKwh,
            pricePerKwh: askPrice,
            isRevealed: true,
            status: 'ACTIVE',
            gridNodeId: p.gridNodeId,
            reputationAtSubmission: params.reputationEnabled ? p.reputation.score : 0.5,
            timestamp: Date.now(),
          });
        }
      } else {
        // Buyer
        let demandKwh = p.baselineDemandKw - p.currentGenerationKw;
        let bidPrice = 0.22;

        if (params.scenario === 'SCENARIO_C_SUPPLY_SHORTAGE') {
          // Heavy demand surge
          demandKwh *= 2.5;
        }

        // Wealthier buyers bid higher, lower wealth bids lower
        if (p.wealthTier === 1) bidPrice = 0.28;
        else if (p.wealthTier === 2) bidPrice = 0.22;
        else bidPrice = 0.16;

        buyOrders.push({
          id: `BUY_${p.id}`,
          participantId: p.id,
          type: 'BUY',
          energyKwh: Number(demandKwh.toFixed(2)),
          remainingEnergyKwh: Number(demandKwh.toFixed(2)),
          pricePerKwh: bidPrice,
          isRevealed: true,
          status: 'ACTIVE',
          gridNodeId: p.gridNodeId,
          reputationAtSubmission: params.reputationEnabled ? p.reputation.score : 0.5,
          timestamp: Date.now(),
        });
      }
    });

    const totalVerifiedSurplus = sellOrders.reduce((sum, o) => sum + o.remainingEnergyKwh, 0);
    const totalDemanded = buyOrders.reduce((sum, o) => sum + o.remainingEnergyKwh, 0);
    const sdr = totalDemanded > 0 ? totalVerifiedSurplus / (totalDemanded + 0.001) : 1.0;

    let totalTradedKwh = 0;
    let totalBuyerCost = 0;
    let totalSellerRevenue = 0;
    let totalBuyerMaxWillingness = 0;
    let totalSellerMinCost = 0;

    const allocationsMap = new Map<string, number>();
    buyOrders.forEach((b) => allocationsMap.set(b.participantId, 0));

    // 3. Execute Matching Mechanism
    if (params.matchingMode === 'GREEDY_PRICE_PRIORITY') {
      // BASELINE: Sort buyers by bid price descending; wealthy consume all supply
      const sortedBuyers = [...buyOrders].sort((a, b) => b.pricePerKwh - a.pricePerKwh);
      const sortedSellers = [...sellOrders].sort((a, b) => a.pricePerKwh - b.pricePerKwh);

      let sIdx = 0;
      for (const buyer of sortedBuyers) {
        while (buyer.remainingEnergyKwh > 0.01 && sIdx < sortedSellers.length) {
          const seller = sortedSellers[sIdx];
          if (buyer.pricePerKwh < seller.pricePerKwh) break;

          const tradeKwh = Math.min(buyer.remainingEnergyKwh, seller.remainingEnergyKwh);
          const price = (buyer.pricePerKwh + seller.pricePerKwh) / 2;

          buyer.remainingEnergyKwh -= tradeKwh;
          seller.remainingEnergyKwh -= tradeKwh;
          totalTradedKwh += tradeKwh;
          totalBuyerCost += tradeKwh * price;
          totalSellerRevenue += tradeKwh * price;
          totalBuyerMaxWillingness += tradeKwh * buyer.pricePerKwh;
          totalSellerMinCost += tradeKwh * seller.pricePerKwh;

          allocationsMap.set(buyer.participantId, (allocationsMap.get(buyer.participantId) || 0) + tradeKwh);

          // Smart Contract State Machine
          const tradeId = `TRD_GREEDY_${buyer.id}_${seller.id}`;
          ledger.createTrade(tradeId, buyer.participantId, seller.participantId, tradeKwh, price);
          ledger.fundTrade(tradeId);
          ledger.confirmDelivery(tradeId, tradeKwh);
          ledger.settleTrade(tradeId);

          if (seller.remainingEnergyKwh <= 0.01) sIdx++;
        }
      }
    } else {
      // PROPOSED: Two-Stage Fairness-Aware Matching & Allocation
      // Stage A: Price compatibility: filter buyer bid >= seller ask
      const compatibleBuyers = buyOrders.filter((b) =>
        sellOrders.some((s) => b.pricePerKwh >= s.pricePerKwh)
      );

      const compatibleDemand = compatibleBuyers.reduce((sum, b) => sum + b.remainingEnergyKwh, 0);
      let availableSupply = totalVerifiedSurplus;

      if (availableSupply > 0 && compatibleDemand > 0) {
        // Stage B: Proportional allocation under scarcity: q_j = min(d_j, S * d_j / sum(d_k))
        compatibleBuyers.forEach((buyer) => {
          const shareRatio = buyer.remainingEnergyKwh / compatibleDemand;
          const proportionalQuota = Math.min(buyer.remainingEnergyKwh, availableSupply * shareRatio);
          const allocated = Number(proportionalQuota.toFixed(3));

          allocationsMap.set(buyer.participantId, allocated);
          buyer.remainingEnergyKwh -= allocated;
          totalTradedKwh += allocated;

          // Dynamic SDR Pricing formula: clamp(lambda * P_ref + (1-lambda) * P_mid, ask, bid)
          const avgAsk = 0.12;
          const { pTrade } = this.marketEngine.calculateIiitDynamicPrice(sdr, avgAsk, buyer.pricePerKwh, 1.0, 0.5);

          totalBuyerCost += allocated * pTrade;
          totalSellerRevenue += allocated * pTrade;
          totalBuyerMaxWillingness += allocated * buyer.pricePerKwh;
          totalSellerMinCost += allocated * avgAsk;

          // Smart Contract State Machine
          const tradeId = `TRD_FAIR_${buyer.id}`;
          ledger.createTrade(tradeId, buyer.participantId, 'pool_sellers', allocated, pTrade);
          ledger.fundTrade(tradeId);

          if (params.scenario === 'SCENARIO_D_DELIVERY_FAILURE' && buyer.participantId === compatibleBuyers[0].participantId) {
            // Injected delivery failure: seller defaulted
            ledger.cancelTrade(tradeId, 'Non-delivery of promised solar surplus');
          } else {
            ledger.confirmDelivery(tradeId, allocated);
            ledger.settleTrade(tradeId);
          }
        });
      }
    }

    // 4. Calculate Jain's Fairness Index
    const demandsList = buyOrders.map((b) => b.energyKwh);
    const allocsList = buyOrders.map((b) => allocationsMap.get(b.participantId) || 0);
    const jainsIndex = this.marketEngine.calculateJainsIndex(allocsList, demandsList);

    // 5. Reputation Responsiveness Evaluation
    let repResponsiveness = 0;
    if (params.scenario === 'SCENARIO_D_DELIVERY_FAILURE') {
      const initialScore = 0.85;
      const r_it = this.reputationEngine.calculatePerformanceScore(0.0, 1.0, false);
      const newScore = this.reputationEngine.updateEwmaReputation(initialScore, r_it, 0.2);
      repResponsiveness = Number(Math.abs(initialScore - newScore).toFixed(3));
    } else if (params.scenario === 'SCENARIO_B_FALSE_REPORTING') {
      const initialScore = 0.85;
      const r_it = this.reputationEngine.calculatePerformanceScore(1.0, 0.4, true);
      const newScore = this.reputationEngine.updateEwmaReputation(initialScore, r_it, 0.2);
      repResponsiveness = Number(Math.abs(initialScore - newScore).toFixed(3));
    }

    const smartContractTrades = ledger.getSmartContractTrades();
    const fundedTrades = smartContractTrades.filter((t) => t.state !== 'CREATED').length;
    const settledTrades = smartContractTrades.filter((t) => t.state === 'SETTLED').length;
    const settlementSuccessRate = fundedTrades > 0 ? Number(((settledTrades / fundedTrades) * 100).toFixed(1)) : 100;

    const energyUtilizationRate =
      totalVerifiedSurplus > 0 ? Number(((totalTradedKwh / totalVerifiedSurplus) * 100).toFixed(1)) : 100;

    const invalidOfferDetectionRate =
      injectedInvalidCount > 0 ? Number(((detectedInvalidCount / injectedInvalidCount) * 100).toFixed(1)) : 100;

    const avgClearedPrice = totalTradedKwh > 0 ? Number((totalBuyerCost / totalTradedKwh).toFixed(4)) : 0.18;
    const buyerSurplus = Math.max(0, Number((totalBuyerMaxWillingness - totalBuyerCost).toFixed(2)));
    const sellerSurplus = Math.max(0, Number((totalSellerRevenue - totalSellerMinCost).toFixed(2)));

    const executionTimeMs = Number((performance.now() - startTime).toFixed(2));

    const allocationsByConsumer = buyOrders.map((b) => {
      const allocated = allocationsMap.get(b.participantId) || 0;
      return {
        id: b.participantId,
        demand: b.energyKwh,
        allocated,
        satisfaction: Number((allocated / (b.energyKwh || 1)).toFixed(2)),
      };
    });

    const metrics: IiitEvaluationMetrics = {
      jainsFairnessIndex: jainsIndex,
      energyUtilizationRate,
      invalidOfferDetectionRate,
      totalBuyerCost: Number(totalBuyerCost.toFixed(2)),
      reputationResponsiveness: repResponsiveness,
      settlementSuccessRate,
      totalGasConsumption: ledger.getTotalGasConsumed(),
      executionTimeMs,
      participantCount: params.participantCount,
      scenario: params.scenario,
      matchingMode: params.matchingMode,
      reputationEnabled: params.reputationEnabled,
      unmetDemandKwh: Number(Math.max(0, totalDemanded - totalTradedKwh).toFixed(2)),
      totalEnergyTradedKwh: Number(totalTradedKwh.toFixed(2)),
      averageClearedPrice: avgClearedPrice,
      buyerSurplus,
      sellerSurplus,
    };

    return {
      metrics,
      validationLogs,
      smartContractTrades,
      allocationsByConsumer,
    };
  }

  /**
   * Runs the 3 Planned Comparisons from Slide 13 side-by-side
   */
  public runPlannedComparisons(participantCount: 10 | 25 | 50 = 25) {
    const baseline = this.runExperiment({
      participantCount,
      scenario: 'SCENARIO_C_SUPPLY_SHORTAGE',
      matchingMode: 'GREEDY_PRICE_PRIORITY',
      reputationEnabled: true,
    });

    const proposed = this.runExperiment({
      participantCount,
      scenario: 'SCENARIO_C_SUPPLY_SHORTAGE',
      matchingMode: 'TWO_STAGE_PROPORTIONAL_FAIR',
      reputationEnabled: true,
    });

    const withoutRep = this.runExperiment({
      participantCount,
      scenario: 'SCENARIO_C_SUPPLY_SHORTAGE',
      matchingMode: 'TWO_STAGE_PROPORTIONAL_FAIR',
      reputationEnabled: false,
    });

    return {
      baseline: baseline.metrics,
      proposed: proposed.metrics,
      withoutRep: withoutRep.metrics,
      baselineAllocations: baseline.allocationsByConsumer,
      proposedAllocations: proposed.allocationsByConsumer,
    };
  }
}
