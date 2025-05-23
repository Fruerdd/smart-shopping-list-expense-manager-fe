export interface UserStatisticsDTO {
  priceAverages?: Array<{
    date: string;
    average: number;
  }>;
  averageSavedPerMonth?: Array<{
    month: string;
    amount: number;
  }>;
  categorySpending?: Array<{
    category: string;
    amount: number;
  }>;
  storeExpenses?: Array<{
    store: string;
    amount: number;
    percentage: number;
  }>;
  spendingOverTime?: {
    [key: string]: number;
  };
} 