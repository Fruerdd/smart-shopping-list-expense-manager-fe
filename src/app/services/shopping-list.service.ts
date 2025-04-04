import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ShoppingList {
  id: number;
  name: string;
  owner: string;
  ownerAvatar: string;
  image: string;
  itemImage: string;
  category: string;
  description: string;
  sharedWith: { name: string; avatar: string }[];
  items: { name: string; quantity: number; price: number, checked?: boolean }[];
}

export interface SharedUser {
  name: string;
  avatar: string;
}

@Injectable({ providedIn: 'root' })
export class ShoppingListService {
  private shoppingLists: ShoppingList[] = [
    {
      id: 1,
      name: 'List #1',
      owner: 'Dave',
      ownerAvatar: 'assets/avatars/avatar-generic.png',
      image: 'assets/images/list-img-generic1.png',
      itemImage: 'assets/images/item-img-generic.png',
      category: 'Home',
      description: 'Groceries for the week. Get everything on the list.',
      sharedWith: [
        { name: 'Eric', avatar: 'assets/avatars/avatar-generic.png' },
        { name: 'Selena', avatar: 'assets/avatars/avatar-generic.png' },
        { name: 'Tom', avatar: 'assets/avatars/avatar-generic.png' },
        { name: 'Liam', avatar: 'assets/avatars/avatar-generic.png' },
        { name: 'Olivia', avatar: 'assets/avatars/avatar-generic.png' },
      ],
      items: [
        { name: 'Milk', quantity: 5, price: 1.89, checked: false },
        { name: 'Bread', quantity: 1, price: 1.75, checked: false },
        { name: 'Chocolate', quantity: 1, price: 3.99, checked: false },
      ],
    },
    {
      id: 2,
      name: 'List #2',
      owner: 'Emma',
      ownerAvatar: 'assets/avatars/avatar-generic.png',
      image: 'assets/images/list-img-generic2.png',
      itemImage: 'assets/images/item-img-generic.png',
      category: 'Work',
      description: 'Office groceries for the next week. Make sure to get the best quality. lipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      sharedWith: [],
      items: [
        { name: 'Crisps', quantity: 4, price: 0.99, checked: false },
        { name: 'Soda', quantity: 2, price: 0.89, checked: false },
        { name: 'Cookies', quantity: 5, price: 2.49, checked: false },
        { name: 'Chips', quantity: 3, price: 1.49, checked: false },
        { name: 'Chocolate', quantity: 1, price: 3.99, checked: false },
      ],
    },
  ];

  getShoppingLists(): Observable<ShoppingList[]> {
    return of(this.shoppingLists);
  }
}
