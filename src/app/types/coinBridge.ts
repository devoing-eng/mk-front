// src/app/types/coinBridge.ts

export type BridgeStep = 'TOKEN_CREATION_1_2' | 'TOKEN_CREATION_2_2' | 'LIQUIDITY_BRIDGE' | 'LIQUIDITY_DEPOSIT'; 
export type StepStatus = 'pending' | 'inProgress' | 'completed' | 'waitingForGas';

export interface BridgeStatus {
  steps: {
    TOKEN_CREATION_1_2: StepStatus;
    TOKEN_CREATION_2_2: StepStatus;
    LIQUIDITY_BRIDGE: StepStatus;
    LIQUIDITY_DEPOSIT: StepStatus;
  };
}

export interface GasStatus {
  step: BridgeStep;
  currentGas: number;
  threshold: number;
  status: StepStatus;
}

interface StepInfo {
  label: string;
  estimatedTime: string; // in minutes
}

export const STEP_MAPPING: Record<BridgeStep, StepInfo> = {
  TOKEN_CREATION_1_2: {
    label: 'Token Created 1/2',
    estimatedTime: '5:00'
  },
  TOKEN_CREATION_2_2: {
    label: 'Token Created 2/2',
    estimatedTime: '5:00'
  },
  LIQUIDITY_BRIDGE: {
    label: 'Liquidity bridged',
    estimatedTime: '6:00'
  },
  LIQUIDITY_DEPOSIT: {
    label: 'Liquidity deposited on Uniswap V4 Pool',
    estimatedTime: '6:00'
  }
} as const;