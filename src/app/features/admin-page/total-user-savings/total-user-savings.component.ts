import { AfterViewInit, Component, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxCategoryChartComponent, IgxCategoryChartModule } from 'igniteui-angular-charts';
import { SavingsService, SavingsDataItem } from '../../../services/savings.service'; 

@Component({
  selector: 'app-total-user-savings',
  standalone: true,
  imports: [CommonModule, IgxCategoryChartModule],
  templateUrl: './total-user-savings.component.html',
  styleUrls: ['./total-user-savings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TotalUserSavingsComponent implements OnInit, AfterViewInit {
  @ViewChild('chart', { static: true }) chart!: IgxCategoryChartComponent;
  
  public savingsData: SavingsDataItem[] = [];

  constructor(private savingsService: SavingsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
      this.savingsService.getSavingsData().subscribe(data => {
      this.savingsData = data;
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
  }
}
