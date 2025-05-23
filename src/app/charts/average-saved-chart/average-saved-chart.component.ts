import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxCategoryChartModule } from 'igniteui-angular-charts';
import { UserProfileService } from '@app/services/user-profile.service';
import { UserStatisticsDTO } from '@app/models/user-statistics.dto';

@Component({
  selector: 'app-average-saved-chart',
  standalone: true,
  imports: [CommonModule, IgxCategoryChartModule],
  templateUrl: './average-saved-chart.component.html',
  styleUrls: ['./average-saved-chart.component.css']
})
export class AverageSavedChartComponent implements OnInit {
  @Input() userId!: string;
  chartData: any[] = [];
  brushes: string[] = ['rgba(255, 159, 64, 0.8)'];
  outlines: string[] = ['rgba(255, 159, 64, 1)'];
  chartOptions = {
    yAxisTitle: 'Amount Saved (KM)',
    xAxisTitle: 'Month'
  };

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit() {
    this.loadChartData();
  }

  private loadChartData() {
    if (this.userId) {
      this.userProfileService.getUserStatistics(this.userId).subscribe({
        next: (stats: UserStatisticsDTO) => {
          const savedData = stats.averageSavedPerMonth || [];
          this.chartData = savedData.map(item => ({
            month: item.month,
            value: item.amount
          }));
        },
        error: (error: Error) => {
          console.error('Error loading savings data:', error);
        }
      });
    }
  }
}
