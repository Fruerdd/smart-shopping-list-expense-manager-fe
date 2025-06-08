import {AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {RouterModule} from '@angular/router';

import {IgxCategoryChartModule, IgxLegendModule} from 'igniteui-angular-charts';

import {AnalyticsService} from '@app/services/analytics.service';
import {IMoneySpent} from "@app/models/user.analytics.model"


@Component({
  selector: 'app-money-spent-chart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IgxCategoryChartModule,
    IgxLegendModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Add this line
  templateUrl: './money-spent-chart.component.html',
  styleUrls: ['./money-spent-chart.component.css']
})
export class MoneySpentChartComponent implements OnInit, AfterViewInit {
  public isBrowser = false;
  public moneySpentData: IMoneySpent[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private analyticsService: AnalyticsService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.analyticsService.getMoneySpent()
      .subscribe(data => this.moneySpentData = data);
  }

  ngAfterViewInit(): void {
    // no extra tweaks needed
  }
}
