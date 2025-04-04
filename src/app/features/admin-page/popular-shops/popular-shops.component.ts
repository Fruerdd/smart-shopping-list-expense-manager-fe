import { AfterViewInit, Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxCategoryChartComponent, IgxCategoryChartModule } from 'igniteui-angular-charts';
import { PopularShopsService, PopularShopDataItem } from '@app/services/popular-shops.service';

@Component({
  selector: 'app-popular-shops',
  standalone: true,
  imports: [CommonModule, IgxCategoryChartModule],
  templateUrl: './popular-shops.component.html',
  styleUrls: ['./popular-shops.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopularShopsComponent implements OnInit, AfterViewInit {
  @ViewChild("chart", { static: true })
  private chart!: IgxCategoryChartComponent;

  public popularShopsData: PopularShopDataItem[] = [];

  constructor(
    private popularShopsService: PopularShopsService,
    private _detector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.popularShopsService.getPopularShopsData().subscribe(data => {
      this.popularShopsData = data;
      this._detector.markForCheck();
    });
  }

  public ngAfterViewInit(): void {
  }
}
