import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileService } from '@app/services/user-profile.service';
import { UserStatisticsDTO } from '@app/models/user-statistics.dto';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
// import {BaseChartDirective} from 'ng2-charts';
import {NgChartsModule} from 'ng2-charts';

@Component({
  selector: 'app-expenses-by-store-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './expenses-by-store-chart.component.html',
  styleUrls: ['./expenses-by-store-chart.component.css']
})
export class ExpensesByStoreChartComponent implements OnInit {
  @Input() userId!: string;

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}%`;
          }
        }
      }
    }
  };

  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56',
        '#4BC0C0', '#9966FF', '#FF9F40'
      ],
      hoverBackgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56',
        '#4BC0C0', '#9966FF', '#FF9F40'
      ],
      borderWidth: 1
    }]
  };

  public pieChartType: ChartType = 'pie';

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit() {
    this.loadChartData();
  }

  private loadChartData() {
    if (this.userId) {
      this.userProfileService.getUserStatistics(this.userId).subscribe({
        next: (stats: UserStatisticsDTO) => {
          const storeExpenses = stats.storeExpenses || [];
          this.pieChartData.labels = storeExpenses.map(item => item.store);
          this.pieChartData.datasets[0].data = storeExpenses.map(item => item.percentage);
        },
        error: (error: Error) => {
          console.error('Error loading store expenses:', error);
        }
      });
    }
  }
}
