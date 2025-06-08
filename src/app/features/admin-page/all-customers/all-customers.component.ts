import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {RouterModule} from '@angular/router';
import {AllCustomersService, Customer} from '@app/services/all-customers.service';

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

  constructor(private allCustomersService: AllCustomersService) {
  }

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

  /** the slice of customers to show on current page */
  get pagedCustomers(): Customer[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.customers.slice(start, start + this.pageSize);
  }

  /** array [1,2,3…totalPages] for template iteration */
  get pages(): number[] {
    return Array.from({length: this.totalPages}, (_, i) => i + 1);
  }

  /** navigate to a given page */
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
