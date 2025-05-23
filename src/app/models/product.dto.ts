export interface CategoryEntity {
    id: string;
    name: string;
    icon?: string;
  }
  
  export interface ProductDTO {
    id: string;
    name: string;
    category: CategoryEntity;
  }