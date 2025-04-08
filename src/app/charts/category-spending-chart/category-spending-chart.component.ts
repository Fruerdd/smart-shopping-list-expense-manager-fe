import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { UserProfileService } from 'src/app/services/user-profile.service';

@Component({
  selector: 'app-category-spending-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './category-spending-chart.component.html',
  styleUrls: ['./category-spending-chart.component.css']
})
export class CategorySpendingChartComponent implements OnInit {
  @Input() userId!: number;

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    indexAxis: 'y', // horizontalni prikaz
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        beginAtZero: true
      }
    }
  };

  public barChartType: 'bar' = 'bar';

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit(): void {
    if (this.userId) {
      this.userProfileService.getUserProfile(this.userId).subscribe(user => {
        const spending = user.categorySpending;

        this.barChartData = {
          labels: spending.map((c: any) => c.category),
          datasets: [
            {
              data: spending.map((c: any) => c.amount),
              label: 'KM',
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              barThickness: 20 // 👈 tanje linije
            }
          ]
        };
      });
    }
  }
}
