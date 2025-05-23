import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxCategoryChartModule } from 'igniteui-angular-charts';
import { UserProfileService } from '@app/services/user-profile.service';
import { UserStatisticsDTO } from '@app/models/user-statistics.dto';

@Component({
  selector: 'app-category-spending-chart',
  standalone: true,
  imports: [CommonModule, IgxCategoryChartModule],
  templateUrl: './category-spending-chart.component.html',
  styleUrls: ['./category-spending-chart.component.css']
})
export class CategorySpendingChartComponent implements OnInit {
  @Input() userId!: string;
  chartData: any[] = [];
  brushes: string[] = ['rgba(75, 192, 192, 0.8)'];
  outlines: string[] = ['rgba(75, 192, 192, 1)'];
  chartOptions = {
    yAxisTitle: 'Amount (KM)',
    xAxisTitle: 'Categories',
    yAxisLabelLeftMargin: 5,
    xAxisLabelTopMargin: 5
  };

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit() {
    this.loadChartData();
  }

  private loadChartData() {
    if (this.userId) {
      this.userProfileService.getUserStatistics(this.userId).subscribe({
        next: (stats: UserStatisticsDTO) => {
          const spending = stats.categorySpending || [];
          this.chartData = spending.map(item => ({
            category: item.category,
            value: item.amount
          }));
        },
        error: (error: Error) => {
          console.error('Error loading category spending:', error);
        }
      });
    }
  }
}
