import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { IgxCategoryChartModule } from 'igniteui-angular-charts';
import { IgxDataChartCoreModule, IgxDataChartCategoryModule, IgxDataChartInteractivityModule, IgxNumericXAxisModule, IgxCategoryYAxisModule, IgxBarSeriesModule, IgxDataToolTipLayerModule, IgxCalloutLayerModule } from 'igniteui-angular-charts';
import { IgxNumericXAxisComponent } from 'igniteui-angular-charts';
import { RouterModule } from '@angular/router';


import { ProductService, IProduct, ILeftChartData, IRightChartData } from '@app/services/product.service';

@Component({
  selector: 'app-product-analytics',
  standalone: true,
  imports: [
    CommonModule,
    IgxCategoryChartModule,
    IgxDataChartCoreModule,
    IgxDataChartCategoryModule,
    IgxDataChartInteractivityModule,
    IgxNumericXAxisModule,
    IgxCategoryYAxisModule,
    IgxBarSeriesModule,
    IgxDataToolTipLayerModule,
    IgxCalloutLayerModule,
    RouterModule
  ],
  templateUrl: './product-analytics.component.html',
  styleUrls: ['./product-analytics.component.css']
})
export class ProductAnalyticsComponent implements OnInit, AfterViewInit {
  @ViewChild('xAxis', { static: true })
  public xAxis!: IgxNumericXAxisComponent;

  public isBrowser = false;
  public topProducts: IProduct[] = [];
  public leftChartData: ILeftChartData[] = [];
  public rightChartData: IRightChartData[] = [];
  public totalProductSearched: number = 0;
  public newAdded: number = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private productService: ProductService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.productService.getTopProducts().subscribe(products => this.topProducts = products);
    this.productService.getLeftChartData().subscribe(data => this.leftChartData = data);
    this.productService.getRightChartData().subscribe(data => this.rightChartData = data);
    this.productService.getTotalProductSearched().subscribe(total => this.totalProductSearched = total);
    this.productService.getNewAdded().subscribe(newAdded => this.newAdded = newAdded);
  }

  ngAfterViewInit(): void {
  }
}
