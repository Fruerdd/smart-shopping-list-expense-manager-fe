import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxCategoryChartModule } from 'igniteui-angular-charts';
import { UserProfileService } from '@app/services/user-profile.service';
import { UserStatisticsDTO } from '@app/models/user-statistics.dto';

@Component({
  selector: 'app-average-price-chart',
  standalone: true,
  imports: [CommonModule, IgxCategoryChartModule],
  templateUrl: './average-price-chart.component.html',
  styleUrls: ['./average-price-chart.component.css']
})
export class AveragePriceChartComponent implements OnInit {
  @Input() userId!: string;
  chartData: any[] = [];
  brushes: string[] = ['#4CAF50'];
  outlines: string[] = ['#2E7D32'];

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit() {
    this.loadChartData();
  }

  private loadChartData() {
    if (this.userId) {
      this.userProfileService.getUserStatistics(this.userId).subscribe({
        next: (stats: UserStatisticsDTO) => {
          const priceAverages = stats.priceAverages || [];
          this.chartData = priceAverages.map(item => ({
            date: item.date,
            value: item.average
          }));
        },
        error: (error: Error) => {
          console.error('Error loading price averages:', error);
        }
      });
    }
  }
}
