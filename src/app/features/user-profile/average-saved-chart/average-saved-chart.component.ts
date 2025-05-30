import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxCategoryChartModule } from 'igniteui-angular-charts';
import { AnalyticsService, ISaving } from '../../../services/analytics.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-average-saved-chart',
  standalone: true,
  imports: [
    CommonModule,
    IgxCategoryChartModule
  ],
  templateUrl: './average-saved-chart.component.html',
  styleUrls: ['./average-saved-chart.component.css']
})
export class AverageSavedChartComponent implements OnInit {
  public savings$!: Observable<ISaving[]>;

  constructor(private analytics: AnalyticsService) {}

  ngOnInit() {
    this.savings$ = this.analytics.getSavings();
  }
}
