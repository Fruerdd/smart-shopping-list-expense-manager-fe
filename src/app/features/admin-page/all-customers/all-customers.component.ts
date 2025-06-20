import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AllCustomersService, Customer } from '@app/services/all-customers.service';

@Component({
  selector: 'app-all-customers',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './all-customers.component.html',
  styleUrls: ['./all-customers.component.css']
})
export class AllCustomersComponent implements OnInit {
  customers: Customer[] = [];

  currentPage = 1;
  readonly pageSize = 10;

  constructor(private allCustomersService: AllCustomersService) {}

  ngOnInit(): void {
    this.allCustomersService.getCustomers().subscribe(data => {
      this.customers = data;
      this.currentPage = 1;
    });
  }

  get totalPages(): number {
    return Math.ceil(this.customers.length / this.pageSize);
  }

  get pagedCustomers(): Customer[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.customers.slice(start, start + this.pageSize);
  }

  get displayPages(): Array<number | string> {
    const total = this.totalPages;
    if (total <= 5) {
      return Array.from({ length: total }, (_v, i) => i + 1);
    }
    return [1, 2, '...', total - 1, total];
  }

  goToPage(page: number | string): void {
    if (typeof page !== 'number') {
      return; 
    }
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
    }
  }

  goToPrevious(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  goToNext(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}
