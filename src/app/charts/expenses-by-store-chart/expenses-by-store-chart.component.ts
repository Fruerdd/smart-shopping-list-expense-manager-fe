import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileService } from 'src/app/services/user-profile.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';
// import {NgChartsModule} from 'ng2-charts';

@Component({
  selector: 'app-expenses-by-store-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './expenses-by-store-chart.component.html',
  styleUrls: ['./expenses-by-store-chart.component.css']
})
export class ExpensesByStoreChartComponent implements OnInit {
  @Input() userId!: string;

  // Pie Chart Configuration
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
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

  ngOnInit(): void {
    if (this.userId) {
      this.userProfileService.getUserProfile(this.userId).subscribe({
        next: (user) => {
          if (user?.storeExpenses) {
            this.pieChartData.labels = user.storeExpenses.map((e: { store: any; }) => e.store);
            this.pieChartData.datasets[0].data = user.storeExpenses.map((e: { percentage: any; }) => e.percentage);
          }
        },
        error: (err) => console.error('Error loading data:', err)
      });
    }
  }
}
