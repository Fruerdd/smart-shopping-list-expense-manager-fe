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
    profilePicture?: string;
    phone?: string;
    address?: string;
    couponCode?: string;
    bonus_points?: number;
    shoppingLists?: ShoppingListDTO[];
    friends?: string[];
    creditsAvailable?: number;
    qrCodeValue?: string;
  }