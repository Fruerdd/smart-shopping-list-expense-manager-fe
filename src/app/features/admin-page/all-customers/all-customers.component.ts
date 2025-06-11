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

  // pagination state
  currentPage = 1;
  readonly pageSize = 10;

  constructor(private allCustomersService: AllCustomersService) {}

  ngOnInit(): void {
    this.allCustomersService.getCustomers().subscribe(data => {
      this.customers = data;
      this.currentPage = 1;
    });
  }

  /** total number of pages */
  get totalPages(): number {
    return Math.ceil(this.customers.length / this.pageSize);
  }

  /** slice of customers for current page */
  get pagedCustomers(): Customer[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.customers.slice(start, start + this.pageSize);
  }

  /**
   * Returns an array of page labels: if totalPages <= 5, returns [1,2,3...totalPages];
   * otherwise returns [1, 2, '...', totalPages-1, totalPages].
   */
  get displayPages(): Array<number | string> {
    const total = this.totalPages;
    if (total <= 5) {
      return Array.from({ length: total }, (_v, i) => i + 1);
    }
    // For total > 5, show first two, ellipsis, last two
    return [1, 2, '...', total - 1, total];
  }

  /** Navigate to a given page label; if it's not a number, ignore */
  goToPage(page: number | string): void {
    if (typeof page !== 'number') {
      return; // skip if ellipsis or invalid
    }
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      // optionally: scroll to top or other side effects
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
