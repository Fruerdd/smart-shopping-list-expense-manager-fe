export interface ShoppingListItemDTO {
    id: string;
    productId: string;
    productName: string;
    image?: string | null;
    price?: number | null;
    storeName?: string | null;
    storeId?: string | null;
    categoryId?: string | null;
    quantity?: number | null;
    isChecked: boolean;
    status?: string | null;
}