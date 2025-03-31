import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Customer {
  name: string;
  phoneNumber: string;
  email: string;
  city: string;
  status: string;
}

@Component({
  selector: 'app-all-customers',
  imports: [CommonModule],
  templateUrl: './all-customers.component.html',
  styleUrls: ['./all-customers.component.css'],
  standalone: true
})
export class AllCustomersComponent {

  // Fake data (needed to be deleted)
  customers: Customer[] = [
    { name: 'Jane Cooper', phoneNumber: '555-123-4567', email: 'jane.cooper@example.com', city: 'Sarajevo', status: 'Active' },
    { name: 'Floyd Miles', phoneNumber: '555-987-6543', email: 'floyd.miles@example.com', city: 'Mostar', status: 'Inactive' },
    { name: 'Ronald Richards', phoneNumber: '555-111-2222', email: 'ronald.richards@example.com', city: 'Tuzla', status: 'Active' },
  ];
}
