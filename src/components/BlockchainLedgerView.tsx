import React, { useState } from 'react';
import { Blocks, CheckCircle2, FileText, Hash } from 'lucide-react';
import { SimulationState, Block, BlockchainTransaction } from '../core/types';

interface BlockchainLedgerViewProps {
  state: SimulationState;
}

export const BlockchainLedgerView: React.FC<BlockchainLedgerViewProps> = ({ state }) => {
  const [selectedBlock, setSelectedBlock] = useState<Block>(
    state.blockchain[state.blockchain.length - 1] || state.blockchain[0]
  );
  const [selectedTx, setSelectedTx] = useState<BlockchainTransaction | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Blockchain Header & Integrity Status */}
      <div className="card">
        <div className="card-header">
          <div>
            <span className="card-title">
              <Blocks size={20} color="var(--purple-400)" /> Smart Contract Ledger &amp; Cryptographic Block Explorer
            </span>
            <span className="card-subtitle">
              Tamper-resistant transaction logging, Merkle tree root verification, and smart contract event logs
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="badge badge-purple">POW/POA CONSENSUS</span>
            <span className="badge badge-green">
              <CheckCircle2 size={13} /> CHAIN INTEGRITY VERIFIED
            </span>
          </div>
        </div>

        {/* Chain Blocks Reel */}
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', padding: '0.5rem 0' }}>
          {state.blockchain
            .slice()
            .reverse()
            .map((b) => {
              const isSelected = selectedBlock.blockNumber === b.blockNumber;
              return (
                <div
                  key={b.blockNumber}
                  onClick={() => {
                    setSelectedBlock(b);
                    setSelectedTx(null);
                  }}
                  style={{
                    background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'rgba(15, 23, 42, 0.7)',
                    border: isSelected ? '2px solid var(--purple-400)' : '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '0.85rem',
                    minWidth: '170px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.88rem', color: isSelected ? 'var(--purple-400)' : '#fff' }}>
                      Block #{b.blockNumber}
                    </strong>
                    <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                      {b.transactions.length} txs
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {b.hash.slice(0, 14)}...
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    Gas: {b.gasUsed.toLocaleString()} units
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Block Details & Transaction List */}
      <div className="panel-grid">
        <div className="card" style={{ gridColumn: 'span 5' }}>
          <div className="card-header">
            <span className="card-title">
              <Hash size={18} color="var(--purple-400)" /> Block #{selectedBlock.blockNumber} Metadata
            </span>
            <span className="badge badge-purple">IMMUTABLE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Block Hash:</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--purple-400)', wordBreak: 'break-all' }}>
                {selectedBlock.hash}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>Previous Block Hash:</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                {selectedBlock.previousHash}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>Merkle Tree Root:</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--cyan-400)', wordBreak: 'break-all' }}>
                {selectedBlock.merkleRoot}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Validator Address:</span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{selectedBlock.validator}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Gas Limit / Gas Used:</span>
              <span>
                {selectedBlock.gasUsed.toLocaleString()} / {selectedBlock.gasLimit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Transactions Table in Selected Block */}
        <div className="card" style={{ gridColumn: 'span 7' }}>
          <div className="card-header">
            <span className="card-title">
              <FileText size={18} color="var(--cyan-400)" /> Transactions in Block ({selectedBlock.transactions.length})
            </span>
            <span className="badge badge-cyan">ON-CHAIN EVENTS</span>
          </div>

          <div className="data-table-wrapper" style={{ maxHeight: '320px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tx Hash</th>
                  <th>Contract Method</th>
                  <th>Origin &rarr; Target</th>
                  <th>Gas</th>
                </tr>
              </thead>
              <tbody>
                {selectedBlock.transactions.map((tx) => (
                  <tr
                    key={tx.txHash}
                    onClick={() => setSelectedTx(tx)}
                    style={{
                      cursor: 'pointer',
                      background: selectedTx?.txHash === tx.txHash ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                    }}
                  >
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--purple-400)' }}>
                      {tx.txHash.slice(0, 12)}...
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          tx.type === 'MATCH_SETTLEMENT'
                            ? 'badge-green'
                            : tx.type === 'ESCROW_SLASH'
                            ? 'badge-red'
                            : tx.type === 'COMMIT_ORDER'
                            ? 'badge-cyan'
                            : 'badge-purple'
                        }`}
                        style={{ fontSize: '0.65rem' }}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem' }}>
                      {tx.from.slice(0, 10)} {tx.to ? `→ ${tx.to.slice(0, 10)}` : ''}
                    </td>
                    <td style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {tx.gasUsed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selected Transaction JSON Payload Inspector */}
          {selectedTx && (
            <div style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Payload Inspector: <strong style={{ color: '#fff' }}>{selectedTx.txHash}</strong>
              </div>
              <pre
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--green-400)',
                  overflowX: 'auto',
                  maxHeight: '120px',
                }}
              >
                {JSON.stringify(selectedTx.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
