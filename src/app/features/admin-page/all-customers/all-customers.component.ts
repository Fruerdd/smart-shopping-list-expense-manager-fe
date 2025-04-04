import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AllCustomersService, Customer } from '@app/services/all-customers.service';

@Component({
  selector: 'app-all-customers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-customers.component.html',
  styleUrls: ['./all-customers.component.css']
})
export class AllCustomersComponent implements OnInit {
  customers: Customer[] = [];

  constructor(private allCustomersService: AllCustomersService) {}

  ngOnInit(): void {
    this.allCustomersService.getCustomers().subscribe(data => {
      this.customers = data;
    });
  }
}
