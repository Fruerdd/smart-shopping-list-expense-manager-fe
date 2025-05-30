// expenses-by-store-chart.component.ts
import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IgxPieChartComponent,
  IgxPieChartModule,
  IgxItemLegendModule
} from 'igniteui-angular-charts';
import { AnalyticsService, IStoreExpense } from '@app/services/analytics.service';

@Component({
  selector: 'app-expenses-by-store-chart',
  standalone: true,
  imports: [CommonModule, IgxPieChartModule, IgxItemLegendModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './expenses-by-store-chart.component.html',
  styleUrls: ['./expenses-by-store-chart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpensesByStoreChartComponent implements OnInit, AfterViewInit {
  @ViewChild('chart', { static: true })
  public chart!: IgxPieChartComponent;

  public data: IStoreExpense[] = [];

  constructor(
    private analytics: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.analytics.getStoreExpenses().subscribe(items => {
      this.data = items;
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    // explode first slice by default, if desired:
    // this.chart.explodedSlices.add(0);
  }

  public onSliceClick(event: any): void {
    const idx = event.args.index;
    const slices = this.chart.explodedSlices;
    // IgxIndexCollection supports .contains() and .remove()
    if (slices.contains(idx)) {
      slices.remove(idx);
    } else {
      slices.add(idx);
    }
  }
}
