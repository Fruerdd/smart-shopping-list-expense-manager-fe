import {CollaboratorDTO} from "./collaborator.dto";
import {ShoppingListItemDTO} from "./shopping-list-item.dto";

export enum ListTypeEnum {
  PERSONAL = 'PERSONAL',
  WORK = 'WORK',
  SHOPPING = 'SHOPPING',
  GROCERY = 'GROCERY',
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY',
  OTHER = 'OTHER'
}

export interface ShoppingListDTO {
  id: string;
  name: string;
  description?: string;
  listType: ListTypeEnum;
  active: boolean;
  ownerId: string;
  ownerName?: string;
  ownerAvatar?: string | null;
  storeId: string;
  storeName?: string;
  image?: string | null;
  category?: string | null;
  items: ShoppingListItemDTO[];
  collaborators: CollaboratorDTO[];
}
