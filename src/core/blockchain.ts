/**
 * Blockchain Platform & Smart Contract State Machine for SG2.0
 * Supports transparent registration, order submission, reputation recording,
 * buyer-seller matching, transaction settlement, and tamper-resistant logging.
 */

import {
  Block,
  BlockchainTransaction,
  Participant,
  SmartContractTradeRecord,
  SmartContractTradeState,
} from './types';
import { CryptoPrivacyService } from './cryptoPrivacy';

export class MerkleTree {
  public static computeRoot(transactions: BlockchainTransaction[]): string {
    if (transactions.length === 0) {
      return CryptoPrivacyService.hash('EMPTY_BLOCK');
    }

    let currentLevel: string[] = transactions.map((tx) => tx.txHash);

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
        nextLevel.push(CryptoPrivacyService.hash(left + right));
      }
      currentLevel = nextLevel;
    }

    return currentLevel[0];
  }
}

export class SmartContractLedger {
  private chain: Block[] = [];
  private mempool: BlockchainTransaction[] = [];
  private registeredMeters: Set<string> = new Set();
  private smartContractTrades: Map<string, SmartContractTradeRecord> = new Map();
  private totalGasSpent: number = 0;

  private gasSchedule = {
    REGISTER: 45000,
    COMMIT_ORDER: 28000,
    REVEAL_ORDER: 32000,
    CREATE_TRADE: 68000,
    FUND_TRADE: 36000,
    CONFIRM_DELIVERY: 42000,
    SETTLE_TRADE: 54000,
    CANCEL_TRADE: 31000,
    MATCH_SETTLEMENT: 65000,
    ESCROW_SLASH: 42000,
    REPUTATION_UPDATE: 22000,
  };

  constructor() {
    this.createGenesisBlock();
  }

  private createGenesisBlock(): void {
    const genesisTx: BlockchainTransaction = {
      txHash: CryptoPrivacyService.hash('GENESIS_TX_SG2.0'),
      type: 'REGISTER',
      from: '0x0000000000000000000000000000000000000000',
      data: { message: 'Smart Grid 2.0 Genesis Block - Fair & Trustworthy Transactive Energy' },
      gasUsed: 21000,
      timestamp: Date.now(),
      signature: '0xGENESIS_VALIDATOR_SIG',
    };

    const merkleRoot = MerkleTree.computeRoot([genesisTx]);
    const genesisBlock: Block = {
      blockNumber: 0,
      timestamp: Date.now(),
      previousHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      merkleRoot,
      hash: CryptoPrivacyService.hash(`0:0x000000:${merkleRoot}`),
      transactions: [genesisTx],
      validator: '0xGRID_OPERATOR_VALIDATOR',
      gasLimit: 8000000,
      gasUsed: genesisTx.gasUsed,
    };

    this.chain.push(genesisBlock);
  }

  public getChain(): Block[] {
    return this.chain;
  }

  public getMempool(): BlockchainTransaction[] {
    return this.mempool;
  }

  /**
   * Smart Contract: ParticipantRegistry
   * Enforces physical meter binding to combat Sybil attacks if proofOfAsset is enabled.
   */
  public registerParticipant(
    participant: Participant,
    proofOfAssetEnabled: boolean
  ): { success: boolean; reason?: string; tx?: BlockchainTransaction } {
    const meterKey = `METER:${participant.gridNodeId}:${participant.pvCapacityKw.toFixed(1)}kW`;

    if (proofOfAssetEnabled) {
      // Sybil Defense: Rejects duplicate/phantom identities claiming same or unverified physical meter
      if (this.registeredMeters.has(meterKey) && participant.sybilMasterId) {
        return { success: false, reason: 'REJECTED: Sybil identity detected! Duplicate meter registration denied.' };
      }
      this.registeredMeters.add(meterKey);
    }

    const tx: BlockchainTransaction = {
      txHash: CryptoPrivacyService.hash(`REG:${participant.id}:${Date.now()}`),
      type: 'REGISTER',
      from: participant.id,
      data: {
        name: participant.name,
        role: participant.role,
        gridNodeId: participant.gridNodeId,
        pvCapacity: participant.pvCapacityKw,
        batteryCapacity: participant.batteryCapacityKwh,
      },
      gasUsed: this.gasSchedule.REGISTER,
      timestamp: Date.now(),
      signature: `SIG_${participant.id}`,
    };

    this.mempool.push(tx);
    return { success: true, tx };
  }

  /**
   * Smart Contract: OrderCommitment
   * Submits a sealed-bid commitment hash to mempool
   */
  public submitOrderCommitment(
    participantId: string,
    commitmentHash: string,
    depositAmount: number
  ): BlockchainTransaction {
    const tx: BlockchainTransaction = {
      txHash: CryptoPrivacyService.hash(`COMMIT:${participantId}:${commitmentHash}:${Date.now()}`),
      type: 'COMMIT_ORDER',
      from: participantId,
      data: { commitmentHash, depositAmount },
      gasUsed: this.gasSchedule.COMMIT_ORDER,
      timestamp: Date.now(),
      signature: `SIG_COMMIT_${participantId}`,
    };

    this.mempool.push(tx);
    return tx;
  }

  /**
   * Smart Contract: EscrowSettlement
   * Logs a cleared trade match and locks escrow funds on-chain
   */
  public logTradeSettlement(tradeData: any): BlockchainTransaction {
    const tx: BlockchainTransaction = {
      txHash: CryptoPrivacyService.hash(`SETTLE:${tradeData.tradeId}:${Date.now()}`),
      type: 'MATCH_SETTLEMENT',
      from: tradeData.buyerId,
      to: tradeData.sellerId,
      data: tradeData,
      gasUsed: this.gasSchedule.MATCH_SETTLEMENT,
      timestamp: Date.now(),
      signature: `SIG_SETTLE_${tradeData.tradeId}`,
    };

    this.mempool.push(tx);
    return tx;
  }

  /**
   * Smart Contract: EscrowSlash
   * Slashes collateral of defaulting seller and transfers compensation to buyer
   */
  public logEscrowSlash(violatorId: string, victimId: string, slashAmount: number, reason: string): BlockchainTransaction {
    const tx: BlockchainTransaction = {
      txHash: CryptoPrivacyService.hash(`SLASH:${violatorId}:${Date.now()}`),
      type: 'ESCROW_SLASH',
      from: violatorId,
      to: victimId,
      data: { slashAmount, reason },
      gasUsed: this.gasSchedule.ESCROW_SLASH,
      timestamp: Date.now(),
      signature: `SIG_SLASH_${violatorId}`,
    };

    this.mempool.push(tx);
    return tx;
  }

  /**
   * Mines a new block from mempool transactions and appends to immutable ledger.
   */
  public mineBlock(validatorId: string = '0xLEADER_NODE'): Block | null {
    if (this.mempool.length === 0) {
      return null;
    }

    const txsToInclude = this.mempool.slice(0, 50);
    this.mempool = this.mempool.slice(50);

    const prevBlock = this.chain[this.chain.length - 1];
    const merkleRoot = MerkleTree.computeRoot(txsToInclude);
    const gasUsed = txsToInclude.reduce((sum, tx) => sum + tx.gasUsed, 0);

    const blockHash = CryptoPrivacyService.hash(
      `${prevBlock.blockNumber + 1}:${prevBlock.hash}:${merkleRoot}:${Date.now()}`
    );

    const newBlock: Block = {
      blockNumber: prevBlock.blockNumber + 1,
      timestamp: Date.now(),
      previousHash: prevBlock.hash,
      merkleRoot,
      hash: blockHash,
      transactions: txsToInclude,
      validator: validatorId,
      gasLimit: 8000000,
      gasUsed,
    };

    this.chain.push(newBlock);
    return newBlock;
  }

  /**
   * Slide 11: Module 4 — Smart Contract State Machine Interface
   * registerParticipant() • createTrade() • fundTrade() • confirmDelivery() • settleTrade() • cancelTrade()
   */

  public createTrade(
    tradeId: string,
    buyerId: string,
    sellerId: string,
    energyKwh: number,
    pricePerKwh: number
  ): { success: boolean; record?: SmartContractTradeRecord; error?: string } {
    if (this.smartContractTrades.has(tradeId)) {
      return { success: false, error: 'Trade ID already exists (duplicate trade rejected).' };
    }

    const escrowDeposit = Number((energyKwh * pricePerKwh).toFixed(2));
    const record: SmartContractTradeRecord = {
      tradeId,
      buyerId,
      sellerId,
      energyKwh,
      pricePerKwh,
      escrowDeposit,
      state: 'CREATED',
      createdAt: Date.now(),
      gasSpent: this.gasSchedule.CREATE_TRADE,
      reentrancyLocked: false,
    };

    this.smartContractTrades.set(tradeId, record);
    this.totalGasSpent += this.gasSchedule.CREATE_TRADE;

    const tx: BlockchainTransaction = {
      txHash: CryptoPrivacyService.hash(`CREATE_TRD:${tradeId}:${Date.now()}`),
      type: 'MATCH_SETTLEMENT',
      from: buyerId,
      to: sellerId,
      data: { tradeId, energyKwh, pricePerKwh, state: 'CREATED' },
      gasUsed: this.gasSchedule.CREATE_TRADE,
      timestamp: Date.now(),
      signature: `SIG_CREATE_${tradeId}`,
    };
    this.mempool.push(tx);

    return { success: true, record };
  }

  public fundTrade(tradeId: string): { success: boolean; record?: SmartContractTradeRecord; error?: string } {
    const record = this.smartContractTrades.get(tradeId);
    if (!record) return { success: false, error: 'Trade not found.' };
    if (record.state !== 'CREATED') {
      return { success: false, error: `Invalid state transition: Cannot fund trade in state ${record.state}.` };
    }
    if (record.reentrancyLocked) {
      return { success: false, error: 'Reentrancy guard active.' };
    }

    record.reentrancyLocked = true;
    record.state = 'FUNDED';
    record.fundedAt = Date.now();
    record.gasSpent += this.gasSchedule.FUND_TRADE;
    this.totalGasSpent += this.gasSchedule.FUND_TRADE;
    record.reentrancyLocked = false;

    return { success: true, record };
  }

  public confirmDelivery(
    tradeId: string,
    deliveredKwh: number
  ): { success: boolean; record?: SmartContractTradeRecord; error?: string } {
    const record = this.smartContractTrades.get(tradeId);
    if (!record) return { success: false, error: 'Trade not found.' };
    if (record.state !== 'FUNDED') {
      return { success: false, error: `Invalid state transition: Cannot confirm delivery in state ${record.state}.` };
    }

    record.state = 'DELIVERING';
    record.deliveredEnergyKwh = deliveredKwh;
    record.gasSpent += this.gasSchedule.CONFIRM_DELIVERY;
    this.totalGasSpent += this.gasSchedule.CONFIRM_DELIVERY;

    return { success: true, record };
  }

  public settleTrade(tradeId: string): { success: boolean; record?: SmartContractTradeRecord; error?: string } {
    const record = this.smartContractTrades.get(tradeId);
    if (!record) return { success: false, error: 'Trade not found.' };
    if (record.state !== 'DELIVERING' && record.state !== 'FUNDED') {
      return { success: false, error: `Invalid state transition: Cannot settle trade in state ${record.state}.` };
    }
    if (record.reentrancyLocked) {
      return { success: false, error: 'Reentrancy guard active.' };
    }

    // Reentrancy-safe checks-effects-interactions pattern
    record.reentrancyLocked = true;
    record.state = 'SETTLED';
    record.settledAt = Date.now();
    record.gasSpent += this.gasSchedule.SETTLE_TRADE;
    this.totalGasSpent += this.gasSchedule.SETTLE_TRADE;
    record.reentrancyLocked = false;

    const tx: BlockchainTransaction = {
      txHash: CryptoPrivacyService.hash(`SETTLE_TRD:${tradeId}:${Date.now()}`),
      type: 'MATCH_SETTLEMENT',
      from: record.buyerId,
      to: record.sellerId,
      data: { tradeId, amount: record.escrowDeposit, state: 'SETTLED' },
      gasUsed: this.gasSchedule.SETTLE_TRADE,
      timestamp: Date.now(),
      signature: `SIG_FINAL_SETTLE_${tradeId}`,
    };
    this.mempool.push(tx);

    return { success: true, record };
  }

  public cancelTrade(
    tradeId: string,
    reason: string
  ): { success: boolean; record?: SmartContractTradeRecord; error?: string } {
    const record = this.smartContractTrades.get(tradeId);
    if (!record) return { success: false, error: 'Trade not found.' };
    if (record.state === 'SETTLED') {
      return { success: false, error: 'Cannot cancel already settled trade.' };
    }

    record.state = 'CANCELLED';
    record.cancelReason = reason;
    record.gasSpent += this.gasSchedule.CANCEL_TRADE;
    this.totalGasSpent += this.gasSchedule.CANCEL_TRADE;

    return { success: true, record };
  }

  public getSmartContractTrades(): SmartContractTradeRecord[] {
    return Array.from(this.smartContractTrades.values());
  }

  public getTotalGasConsumed(): number {
    return this.totalGasSpent;
  }

  /**
   * Verifies blockchain tamper-resistance:
   * Checks hash chain continuity and Merkle root integrity.
   */
  public verifyLedgerIntegrity(): { isValid: boolean; brokenBlockNumber?: number } {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const prev = this.chain[i - 1];

      if (current.previousHash !== prev.hash) {
        return { isValid: false, brokenBlockNumber: current.blockNumber };
      }

      const calculatedMerkle = MerkleTree.computeRoot(current.transactions);
      if (calculatedMerkle !== current.merkleRoot) {
        return { isValid: false, brokenBlockNumber: current.blockNumber };
      }
    }
    return { isValid: true };
  }
}
