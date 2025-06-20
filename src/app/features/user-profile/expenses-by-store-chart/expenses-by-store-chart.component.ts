import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IgxItemLegendModule, IgxPieChartComponent, IgxPieChartModule} from 'igniteui-angular-charts';
import {AnalyticsService} from '@app/services/analytics.service';
import {IStoreExpense} from "@app/models/user.analytics.model"


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
  @ViewChild('chart', {static: true})
  public chart!: IgxPieChartComponent;

  public data: IStoreExpense[] = [];

  constructor(
    private analytics: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {
  }

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
