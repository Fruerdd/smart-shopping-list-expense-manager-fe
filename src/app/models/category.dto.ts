import {ShoppingListItemDTO} from "./shopping-list-item.dto";

export interface CategoryDTO {
  id: string;
  name: string;
  icon?: string;
  products: ShoppingListItemDTO[];
}
