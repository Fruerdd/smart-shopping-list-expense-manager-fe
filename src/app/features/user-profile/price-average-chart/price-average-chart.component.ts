// price-average-chart.component.ts
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
import { AnalyticsService, IPriceAverage } from '@app/services/analytics.service';

@Component({
  selector: 'app-price-average-chart',
  standalone: true,
  imports: [CommonModule, IgxCategoryChartModule],
  templateUrl: './price-average-chart.component.html',
  styleUrls: ['./price-average-chart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceAverageChartComponent implements OnInit, AfterViewInit {
  @ViewChild('chart', { static: true })
  public chart!: IgxCategoryChartComponent;

  public data: IPriceAverage[] = [];

  constructor(
    private analytics: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.analytics.getPriceAverages().subscribe(items => {
      this.data = items;
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    // chart will automatically size itself
  }
}
