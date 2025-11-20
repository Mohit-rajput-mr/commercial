export interface YearlyData {
  year: number;
  value: number;
}

export interface Submarket {
  name: string;
  office?: { capRate: number; vacancy?: number };
  multifamily?: { capRate: number; vacancy?: number };
  industrial?: { capRate: number; vacancy?: number };
  retail?: { capRate: number; vacancy?: number };
  hotel?: { capRate: number };
  rent?: string;
  yoyChange?: number;
  grade?: string;
}

export interface CMBSData {
  total: string;
  office: number;
  multifamily: number;
  retail: number;
  industrial: number;
  hotel: number;
}

export interface PerformanceData {
  propertyType: string;
  appreciation: string;
  period: string;
}

export interface TransactionVolume {
  '2023': string;
  '2024': string;
  '2025': string;
}

export interface CityMarketData {
  name: string;
  slug: string;
  overview: {
    marketSize: string;
    totalValue: string;
    gdp: string;
    population: string;
    employment: string;
    unemployment: number;
  };
  capRates: {
    office: YearlyData[];
    multifamily: YearlyData[];
    industrial: YearlyData[];
    retail: YearlyData[];
  };
  vacancyRates: {
    office: number;
    multifamily: number;
    industrial: number;
    retail: number;
  };
  askingRents: {
    office: string;
    multifamily: string;
    industrial: string;
    retail: string;
  };
  transactionVolume: TransactionVolume;
  submarkets: Submarket[];
  cmbsMaturity?: CMBSData;
  historicalPerformance?: PerformanceData[];
  marketDrivers?: string[];
  marketCharacteristics?: string[];
  growthDrivers?: string[];
  imageUrl?: string;
}

