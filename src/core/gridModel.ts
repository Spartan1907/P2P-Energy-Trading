/**
 * Physical Distribution Grid Model for Smart Grid 2.0 (SG2.0)
 * Directly addresses RQ3: Can basic grid conditions, such as local supply,
 * demand, and congestion, be incorporated into P2P matching without significantly
 * reducing market efficiency?
 */

import { GridNode } from './types';

export class DistributionGridModel {
  private nodes: Map<string, GridNode> = new Map();
  // Base voltage (e.g. 400V 3-phase or 230V single phase equivalent)
  public readonly nominalVoltageV: number = 230;
  // Penalty coefficient for thermal overload ($/kWh per kW overload)
  public readonly congestionPenaltyFactor: number = 0.05;

  constructor() {
    this.initializeStandardFeeder();
  }

  /**
   * Initializes a realistic 8-bus radial distribution feeder
   * Node 1 is closest to the transformer substation; Node 8 is at the terminal edge.
   */
  public initializeStandardFeeder(): void {
    this.nodes.clear();

    const feederConfig = [
      { id: 'node-1', name: 'Substation Lateral A1', bus: 1, distKm: 0.2, capKw: 120, rOhm: 0.05 },
      { id: 'node-2', name: 'Neighborhood Cluster A2', bus: 2, distKm: 0.5, capKw: 90, rOhm: 0.12 },
      { id: 'node-3', name: 'Residential Lateral B1', bus: 3, distKm: 0.8, capKw: 75, rOhm: 0.20 },
      { id: 'node-4', name: 'Residential Lateral B2', bus: 4, distKm: 1.2, capKw: 65, rOhm: 0.32 },
      { id: 'node-5', name: 'Community Center C1', bus: 5, distKm: 1.6, capKw: 55, rOhm: 0.44 },
      { id: 'node-6', name: 'Suburban Lateral C2', bus: 6, distKm: 2.1, capKw: 45, rOhm: 0.58 },
      { id: 'node-7', name: 'Feeder Outskirt D1', bus: 7, distKm: 2.7, capKw: 35, rOhm: 0.74 },
      { id: 'node-8', name: 'Terminal Edge D2 (Weakest)', bus: 8, distKm: 3.4, capKw: 25, rOhm: 0.95 },
    ];

    for (const cfg of feederConfig) {
      this.nodes.set(cfg.id, {
        id: cfg.id,
        name: cfg.name,
        busNumber: cfg.bus,
        distanceFromSubstationKm: cfg.distKm,
        lineResistanceOhm: cfg.rOhm,
        lineCapacityKw: cfg.capKw,
        currentPowerFlowKw: 0,
        voltagePu: 1.0,
        isCongested: false,
        congestionSurchargePerKwh: 0,
      });
    }
  }

  public getAllNodes(): GridNode[] {
    return Array.from(this.nodes.values());
  }

  public getNode(nodeId: string): GridNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Updates nodal power flows, voltages, and congestion states
   * given the net active power injected (+) or withdrawn (-) at each bus.
   */
  public calculatePowerFlows(nodalNetInjections: Map<string, number>): void {
    const sortedNodes = this.getAllNodes().sort((a, b) => b.busNumber - a.busNumber);

    // Backward power flow summation for radial tree
    let cumulativeDownstreamPower = 0;
    const branchFlows = new Map<string, number>();

    for (const node of sortedNodes) {
      const netInjection = nodalNetInjections.get(node.id) || 0; // Positive = exporting, Negative = importing
      cumulativeDownstreamPower += Math.abs(netInjection);
      branchFlows.set(node.id, cumulativeDownstreamPower);
    }

    // Forward voltage drop calculation: V_k = 1.0 - (I * R) / V_nominal
    for (const node of this.getAllNodes()) {
      const branchFlowKw = branchFlows.get(node.id) || 0;
      node.currentPowerFlowKw = branchFlowKw;

      // Check thermal line capacity
      const overloadKw = Math.max(0, branchFlowKw - node.lineCapacityKw);
      node.isCongested = overloadKw > 0;

      // Distribution Locational Marginal Price (D-LMP) adder
      if (node.isCongested) {
        node.congestionSurchargePerKwh = Number((overloadKw * this.congestionPenaltyFactor * 0.01).toFixed(4));
      } else {
        node.congestionSurchargePerKwh = 0;
      }

      // Simplified voltage calculation with line losses
      const currentAmps = (branchFlowKw * 1000) / this.nominalVoltageV;
      const voltageDropV = currentAmps * node.lineResistanceOhm * 0.05;
      const calculatedV = (this.nominalVoltageV - voltageDropV) / this.nominalVoltageV;

      // Bound within realistic physics (e.g. 0.90 to 1.05 p.u.)
      node.voltagePu = Number(Math.max(0.88, Math.min(1.05, calculatedV)).toFixed(3));
    }
  }

  /**
   * Computes the line loss cost and congestion surcharge between a seller and buyer node.
   */
  public evaluateTradePhysicalImpact(
    sellerNodeId: string,
    buyerNodeId: string,
    energyKwh: number
  ): {
    isFeasible: boolean;
    congestionSurcharge: number;
    lineLossKwh: number;
    lineLossCost: number;
    feederDistanceKm: number;
  } {
    const sellerNode = this.nodes.get(sellerNodeId);
    const buyerNode = this.nodes.get(buyerNodeId);

    if (!sellerNode || !buyerNode) {
      return {
        isFeasible: true,
        congestionSurcharge: 0,
        lineLossKwh: 0,
        lineLossCost: 0,
        feederDistanceKm: 1.0,
      };
    }

    const distDelta = Math.abs(sellerNode.distanceFromSubstationKm - buyerNode.distanceFromSubstationKm);
    const avgResistance = (sellerNode.lineResistanceOhm + buyerNode.lineResistanceOhm) / 2;

    // Line loss formula: Loss proportional to I^2 * R * distance
    const lossFraction = Math.min(0.08, 0.015 * distDelta * (avgResistance + 0.1));
    const lineLossKwh = Number((energyKwh * lossFraction).toFixed(4));

    // Congestion adder is highest if either node is currently congested
    const maxCongestionAdder = Math.max(sellerNode.congestionSurchargePerKwh, buyerNode.congestionSurchargePerKwh);
    const congestionSurcharge = Number((energyKwh * maxCongestionAdder).toFixed(4));

    // A trade is infeasible only if severe over-congestion (> 140% line limit)
    const isSevere =
      (sellerNode.currentPowerFlowKw > sellerNode.lineCapacityKw * 1.4) ||
      (buyerNode.currentPowerFlowKw > buyerNode.lineCapacityKw * 1.4);

    return {
      isFeasible: !isSevere,
      congestionSurcharge,
      lineLossKwh,
      lineLossCost: Number((lineLossKwh * 0.15).toFixed(4)), // Assuming $0.15/kWh loss value
      feederDistanceKm: Number(distDelta.toFixed(2)),
    };
  }
}
