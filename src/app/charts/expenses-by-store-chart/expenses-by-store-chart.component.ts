import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartType, ChartConfiguration, ChartData } from 'chart.js'; // ✅ dodaj ChartData
import { UserProfileService } from 'src/app/services/user-profile.service';

@Component({
  selector: 'app-expenses-by-store-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './expenses-by-store-chart.component.html',
  styleUrls: ['./expenses-by-store-chart.component.css']
})
export class ExpensesByStoreChartComponent implements OnInit {
  @Input() userId!: number;

  public doughnutChartData: ChartData<'doughnut', number[], string> = {
    labels: [],
    datasets: []
  };
  
  public doughnutChartType: ChartType = 'doughnut';
  
  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'right' }
    }
  };

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit(): void {
    if (this.userId) {
      this.userProfileService.getUserProfile(this.userId).subscribe(user => {
        if (user?.storeExpenses) {
          const labels = user.storeExpenses.map((e: any) => e.store);
          const data = user.storeExpenses.map((e: any) => e.percentage);

          this.doughnutChartData = {
            labels,
            datasets: [
              {
                data,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                borderWidth: 1
              }
            ]
          };
        }
      });
    }
  }
}
