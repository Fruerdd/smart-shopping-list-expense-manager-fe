import { ShoppingListDTO } from "./shopping-list.dto";

export enum LoyaltyTierEnum {
    BRONZE = 'BRONZE',
    SILVER = 'SILVER',
    GOLD = 'GOLD',
  }
  
  export interface UserDTO {
    id: string;
    email: string;
    name: string;
    loyaltyTier?: LoyaltyTierEnum;
    avatar?: string;
    phone?: string;
    address?: string;
    referralCode?: string;
    couponCode?: string;
    bonus_points?: number;
    loyaltyPoints?: number;
    shoppingLists?: ShoppingListDTO[];
    friends?: string[];
    creditsAvailable?: number;
    qrCodeValue?: string;
  }