import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxFinancialChartModule } from 'igniteui-angular-charts';
import { UserProfileService } from '@app/services/user-profile.service';
import { UserStatisticsDTO } from '@app/models/user-statistics.dto';

@Component({
  selector: 'app-money-spent-chart',
  standalone: true,
  imports: [CommonModule, IgxFinancialChartModule],
  templateUrl: './money-spent-chart.component.html',
  styleUrls: ['./money-spent-chart.component.css']
})
export class MoneySpentChartComponent implements OnInit {
  @Input() userId!: string;
  chartData: any[] = [];
  chartOptions = {
    yAxisTitle: 'Amount (KM)',
    xAxisTitle: 'Month',
    thickness: 2,
    isVerticalZoomEnabled: false,
    isHorizontalZoomEnabled: false
  };

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit() {
    this.loadChartData();
  }

  private loadChartData() {
    if (this.userId) {
      this.userProfileService.getUserStatistics(this.userId).subscribe({
        next: (stats: UserStatisticsDTO) => {
          const spending = stats.spendingOverTime || {};
          this.chartData = Object.entries(spending).map(([date, amount]) => ({
            date,
            value: amount
          }));
        },
        error: (error: Error) => {
          console.error('Error loading spending data:', error);
        }
      });
    }
  }
}
