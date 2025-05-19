// src/app/features/admin-page/product-analytics/product-analytics.component.ts

import {
  Component,
  OnInit,
  AfterViewInit,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  // spline chart
  IgxCategoryChartModule,

  // core & interactivity for the DataChart
  IgxDataChartCoreModule,
  IgxDataChartCategoryModule,         // ← register category axes
  IgxDataChartInteractivityModule,
  IgxDataToolTipLayerModule,
  IgxCalloutLayerModule,

  // axes & series for column chart
  IgxCategoryXAxisModule,
  IgxNumericYAxisModule,
  IgxColumnSeriesModule
} from 'igniteui-angular-charts';

import {
  ProductService,
  ITopProduct,
  IDailySearch,
  IMonthlyProductAdd
} from '@app/services/product.service';

@Component({
  selector: 'app-product-analytics',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

    // spline chart
    IgxCategoryChartModule,

    // data‐chart + category support
    IgxDataChartCoreModule,
    IgxDataChartCategoryModule,         // ← **don't omit this**
    IgxDataChartInteractivityModule,
    IgxDataToolTipLayerModule,
    IgxCalloutLayerModule,

    // column chart pieces
    IgxCategoryXAxisModule,
    IgxNumericYAxisModule,
    IgxColumnSeriesModule
  ],
  templateUrl: './product-analytics.component.html',
  styleUrls: ['./product-analytics.component.css']
})
export class ProductAnalyticsComponent implements OnInit, AfterViewInit {
  public isBrowser            = false;
  public topProducts:     ITopProduct[]        = [];
  public dailySearches:   IDailySearch[]       = [];
  public weeklySearches:  IDailySearch[]       = [];
  public monthlyAdds:     IMonthlyProductAdd[] = [];

  public totalProductSearched = 0;
  public newAdded             = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private productSvc: ProductService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // 1) top‐sellers table
    this.productSvc.getTopProducts()
      .subscribe(list => this.topProducts = list);

    // 2) daily searches spline + total
    this.productSvc.getDailySearches()
      .subscribe(data => {
        this.dailySearches = data;
        this.totalProductSearched =
          data.reduce((sum, d) => sum + d.searches, 0);
      });

    // 3) weekly searches → “new added” stat
    this.productSvc.getWeeklySearches()
      .subscribe(data => {
        this.weeklySearches = data;
        this.newAdded =
          data.reduce((sum, d) => sum + d.searches, 0);
      });

    // 4) monthly adds column chart
    this.productSvc.getMonthlyAdds()
      .subscribe(data => this.monthlyAdds = data);

  }

  ngAfterViewInit(): void {
    // no extra tweaks needed
  }
}
