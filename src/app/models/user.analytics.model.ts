// src/app/models/user.analytics.model.ts

/**
 * Represents total money spent per month, comparing this year vs last year.
 */
export interface IMoneySpent {
  /** Abbreviated month name, e.g. 'Jan' */
  month: string;
  /** Amount spent in the current year */
  thisYear: number;
  /** Amount spent in the previous year */
  lastYear: number;
}

/**
 * Represents the average price of a given item across all stores.
 */
export interface IPriceAverage {
  /** Name of the item, e.g. 'Coffee' */
  item: string;
  /** Average price of that item */
  avgPrice: number;
}

/**
 * Represents the percentage of total expenses attributed to a store.
 */
export interface IStoreExpense {
  /** Store name, e.g. 'Mercator' */
  store: string;
  /** Percentage of overall spending at this store */
  pct: number;
}

/**
 * Represents total amount saved per month.
 */
export interface ISaving {
  /** Abbreviated month name, e.g. 'Jan' */
  month: string;
  /** Amount saved in that month */
  amount: number;
}

/**
 * Represents total spending per product category.
 */
export interface ICategorySpend {
  /** Category name, e.g. 'Dairy' */
  category: string;
  /** Total spent in that category */
  spent: number;
}
