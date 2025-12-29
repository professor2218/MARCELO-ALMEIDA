export enum AssetType {
  STOCK = 'Ação',
  FII = 'FII',
  CRYPTO = 'Cripto',
  FIXED = 'Renda Fixa',
  CASH = 'Caixa'
}

export interface Asset {
  id: string;
  ticker: string;
  name: string;
  type: AssetType;
  quantity: number;
  averagePrice: number;
  currentPrice: number; // In a real app, this would be live
  sector?: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  profitability: number; // Percentage
  profitabilityValue: number; // Currency
}

export type ViewState = 'dashboard' | 'wallet' | 'advisor' | 'vision-board';

export interface ImageGenerationConfig {
  prompt: string;
  resolution: '1K' | '2K' | '4K';
}

export interface VideoGenerationConfig {
  prompt: string;
  imageBytes?: string;
  aspectRatio: '16:9' | '9:16';
}
