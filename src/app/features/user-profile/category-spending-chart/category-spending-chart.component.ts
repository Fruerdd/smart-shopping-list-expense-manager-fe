// category-spending-chart.component.ts
import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IgxCategoryChartComponent,
  IgxCategoryChartModule
} from 'igniteui-angular-charts';
import { AnalyticsService } from '@app/services/analytics.service';
import { ICategorySpend } from "@app/models/user.analytics.model"


@Component({
  selector: 'app-category-spending-chart',
  standalone: true,
  imports: [CommonModule, IgxCategoryChartModule],
  templateUrl: './category-spending-chart.component.html',
  styleUrls: ['./category-spending-chart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategorySpendingChartComponent implements OnInit, AfterViewInit {
  @ViewChild('chart', { static: true })
  public chart!: IgxCategoryChartComponent;

  public data: ICategorySpend[] = [];

  constructor(
    private analytics: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.analytics.getCategorySpending().subscribe(items => {
      this.data = items;
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    // no further tweaks needed — chart will auto-size
  }
}
