/**
 * Core Type Definitions for Fair & Trustworthy P2P Energy Trading in Smart Grid 2.0 (SG2.0)
 */

export type ParticipantRole =
  | 'PROSUMER_ELITE'      // Tier 1: Large PV (10-15 kW) + Battery (15-20 kWh) + EV
  | 'PROSUMER_STANDARD'   // Tier 2: Moderate PV (3-6 kW), no battery
  | 'CONSUMER_VULNERABLE' // Tier 3: Zero generation, inelastic demand, low-income
  | 'ADVERSARY';          // Malicious participant running configured attack

export type AttackType =
  | 'NONE'
  | 'SYBIL'
  | 'SELLER_CARTEL'
  | 'BUYER_MONOPSONY'
  | 'WASH_TRADING'
  | 'PHANTOM_ENERGY'
  | 'ON_OFF_ATTACK'
  | 'FALSE_DATA_ORACLE'
  | 'FAKE_RATING_BALLOT';

export interface Participant {
  id: string;
  name: string;
  role: ParticipantRole;
  gridNodeId: string;
  wealthTier: 1 | 2 | 3;
  pvCapacityKw: number;
  batteryCapacityKwh: number;
  batterySoC: number;        // State of Charge [0, 1]
  batteryMaxPowerKw: number; // Max charge/discharge rate
  baselineDemandKw: number;
  currentGenerationKw: number;
  netDemandKw: number;       // > 0 means buying, < 0 means selling
  balance: number;           // Wallet balance ($)
  lockedEscrow: number;      // Staked or locked in escrow ($)
  reputation: ReputationScore;
  attackType?: AttackType;
  sybilMasterId?: string;    // If this is a Sybil puppet of an attacker
  isColluding?: boolean;
}

export interface ReputationScore {
  alpha: number;             // Successful delivered volume / trades
  beta: number;              // Failed / defaulted volume / trades
  score: number;             // Current trust score in [0, 1]
  totalTrades: number;
  fulfilledKwh: number;
  defaultedKwh: number;
  consecutiveDefaults: number;
  lastUpdatedEpoch: number;
}

export interface GridNode {
  id: string;
  name: string;
  busNumber: number;
  distanceFromSubstationKm: number;
  lineResistanceOhm: number;
  lineCapacityKw: number;
  currentPowerFlowKw: number;
  voltagePu: number;         // Per-unit voltage (nominal 1.0, allowed 0.95 - 1.05)
  isCongested: boolean;
  congestionSurchargePerKwh: number; // D-LMP congestion adder ($/kWh)
}

export interface OrderCommitment {
  commitmentHash: string;   // SHA-256(orderType + price + energy + salt)
  depositLocked: number;
  timestamp: number;
}

export interface Order {
  id: string;
  participantId: string;
  type: 'BUY' | 'SELL';
  energyKwh: number;
  pricePerKwh: number;
  commitmentHash?: string;
  salt?: string;
  isRevealed: boolean;
  status: 'COMMITTED' | 'ACTIVE' | 'PARTIALLY_MATCHED' | 'MATCHED' | 'CANCELLED';
  remainingEnergyKwh: number;
  gridNodeId: string;
  reputationAtSubmission: number;
  timestamp: number;
}

export interface TradeMatch {
  tradeId: string;
  buyOrderId: string;
  sellOrderId: string;
  buyerId: string;
  sellerId: string;
  buyerNodeId: string;
  sellerNodeId: string;
  clearedPricePerKwh: number;
  energyKwh: number;
  grossAmount: number;
  congestionSurcharge: number;
  lineLossCost: number;
  netPriceBuyerPerKwh: number;
  netPriceSellerPerKwh: number;
  status: 'PENDING_DELIVERY' | 'SETTLED' | 'DEFAULTED_BY_SELLER' | 'DEFAULTED_BY_BUYER';
  deliveredEnergyKwh?: number;
  escrowTxHash: string;
  timestamp: number;
  blockNumber: number;
}

export interface BlockchainTransaction {
  txHash: string;
  type: 'REGISTER' | 'COMMIT_ORDER' | 'REVEAL_ORDER' | 'MATCH_SETTLEMENT' | 'ESCROW_SLASH' | 'REPUTATION_UPDATE';
  from: string;
  to?: string;
  data: any;
  gasUsed: number;
  timestamp: number;
  signature: string;
}

export interface Block {
  blockNumber: number;
  timestamp: number;
  previousHash: string;
  merkleRoot: string;
  hash: string;
  transactions: BlockchainTransaction[];
  validator: string;
  gasLimit: number;
  gasUsed: number;
}

export interface MarketMetrics {
  epoch: number;
  timeOfDayHour: number;
  totalGenerationKw: number;
  totalDemandKw: number;
  supplyDemandRatio: number; // SDR = Total Supply / Total Demand
  marketBasePricePerKwh: number;
  averageClearedPricePerKwh: number;
  gridRetailPricePerKwh: number;
  feedInTariffPerKwh: number;
  totalTradedKwh: number;
  unmetDemandKwh: number;
  curtailedSupplyKwh: number;
  transactionSuccessRate: number;
  marketEfficiency: number;  // Cleared Welfare / Optimal Welfare
  congestionEventsCount: number;
}

export interface FairnessAuditMetrics {
  jainsFairnessIndex: number;         // J in [1/n, 1.0], 1.0 is completely fair
  giniCoefficient: number;            // G in [0, 1.0], 0 is completely equal
  socialWelfareTotal: number;         // Combined consumer surplus + prosumer profit ($)
  tier1Utility: number;               // Elite prosumers average utility ($)
  tier2Utility: number;               // Standard prosumers average utility ($)
  tier3Utility: number;               // Vulnerable consumers average utility ($)
  wealthDivideRatio: number;          // Tier1 / Tier3 utility ratio (higher = more unfair)
  edgeToSubstationPriceRatio: number; // Price paid by edge node vs central node
  coldStartEscapeRate: number;        // Probability a new node with 0 rep gets matched
  weatherShockFalsePenaltyCount: number;
  congestionBurdenEdgeShare: number;  // % of total congestion fees borne by edge nodes
}

export interface AttackEvaluationMetrics {
  attackType: AttackType;
  isActive: boolean;
  attackerProfitAdvantagePct: number; // % extra profit gained compared to honest play
  cartelPriceInflationPct: number;    // % market price inflated above competitive equilibrium
  sybilMarketSharePct: number;        // % of trades captured by Sybil puppet accounts
  washTradingVolumePct: number;       // % circular fake volume detected/attempted
  phantomEnergyDefaultRate: number;   // % of phantom promises that defaulted on delivery
  defenseEffectivenessScore: number;  // [0, 100]% mitigation efficacy
}

export interface ReputationManipulationMetrics {
  fakeRatingInjectionCount: number;
  ballotStuffingVoteCount: number;
  reputationInflationPct: number;
  falseDataClaimsKwh: number;
  actualDeliveredKwh: number;
  dataIntegrityViolationRate: number;
  oracleVerificationRate: number;
  defenseBlockedFakeRatings: number;
  defenseBlockedBallotStuffs: number;
  falseDataPenaltiesApplied: number;
}

export interface SybilDefensePipeline {
  didRegistrationEnabled: boolean;          // 1. Registration: Verifiable DID document check
  meterHardwareAuthEnabled: boolean;       // 2. Authentication: Smart meter hardware key challenge-response
  economicStakingRequired: boolean;        // 3. Staking: Financial collateral barrier ($150 per identity)
  stakeAmountPerIdentity: number;          // Stake required ($)
  proofOfPhysicalAssetEnabled: boolean;    // 4. Sybil Resistance: Physical NMI hardware capacity binding
  bayesianAntiBallotEnabled: boolean;      // 5. Robust Reputation: Diminishing returns & cycle-pruning on votes
}

export interface SybilDefenseStatus {
  layer1RegistrationResult: 'PASSED' | 'BLOCKED_MISSING_DID';
  layer2AuthenticationResult: 'PASSED' | 'BLOCKED_INVALID_METER_SIG';
  layer3StakingResult: 'PASSED' | 'BLOCKED_INSUFFICIENT_COLLATERAL';
  layer4SybilResistanceResult: 'PASSED' | 'BLOCKED_DUPLICATE_METER_NMI';
  layer5RobustReputationResult: 'PASSED' | 'BALLOT_STUFFING_DISCOUNTED';
  puppetsBlockedCount: number;             // Number of puppets blocked (0 to 4)
  economicCostToAttacker: number;          // Total stake required from attacker ($)
  attackerSuccessProbability: number;      // % probability attacker successfully manipulates market
  overallSybilDefended: boolean;
}

export interface SystemFairnessPolicies {
  lifelineQuotaEnabled: boolean;          // Guaranteed basic essential energy for Tier 3
  lifelineQuotaKwh: number;               // e.g., 2.0 kWh/hour protected
  lifelineDiscountRate: number;           // e.g., 25% discount funded by market pool
  congestionSocializationEnabled: boolean;// Pool congestion fees and redistribute to edge nodes
  weatherForgivenessEnabled: boolean;     // Cross-check neighborhood solar irradiance to exempt cloudy defaults
  dynamicStakingEnabled: boolean;         // Capacity-proportional stake instead of flat capital barrier
  sybilProofOfAssetEnabled: boolean;      // Require cryptographically attested meter capacity
  antiWashCycleDetectionEnabled: boolean; // Prune circular trading rings
  oracleVerificationEnabled: boolean;         // Cross-check claimed energy against smart meter oracle data
  antiBallotStuffingEnabled: boolean;          // Rate-limit and verify rating/voting patterns
  sybilDefensePipeline: SybilDefensePipeline; // 5-Pillar Sybil Attack Solution
}

export interface SimulationState {
  epoch: number;
  hour: number;                           // 0 to 23
  isRunning: boolean;
  speedMs: number;
  participants: Participant[];
  gridNodes: GridNode[];
  activeOrders: Order[];
  recentMatches: TradeMatch[];
  blockchain: Block[];
  pendingMempool: BlockchainTransaction[];
  marketMetrics: MarketMetrics;
  fairnessMetrics: FairnessAuditMetrics;
  attackMetrics: AttackEvaluationMetrics;
  reputationManipulationMetrics: ReputationManipulationMetrics;
  sybilDefenseStatus: SybilDefenseStatus;
  fairnessPolicies: SystemFairnessPolicies;
  activeAttack: AttackType;
  solarIrradiancePu: number;              // Current solar intensity [0, 1]
  weatherCondition: 'SUNNY' | 'PARTLY_CLOUDY' | 'HEAVY_STORM';
}
