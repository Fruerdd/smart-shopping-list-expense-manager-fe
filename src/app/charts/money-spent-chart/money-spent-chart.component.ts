import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { UserProfileService } from 'src/app/services/user-profile.service';

@Component({
  selector: 'app-money-spent-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './money-spent-chart.component.html',
  styleUrls: ['./money-spent-chart.component.css']
})
export class MoneySpentChartComponent implements OnInit {
  @Input() userId!: number;

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: []
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: {
        position: 'top'
    }
  }
  };

  public lineChartType: 'line' = 'line';

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit(): void {
    if (this.userId) {
      this.userProfileService.getUserProfile(this.userId).subscribe(user => {
        const spending = user.spendingOverTime;

        this.lineChartData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul','Aug','Sep','Oct','Nov', 'Dec'],
          datasets: [
            {
              data: spending.currentYear,
              label: 'This Year',
              borderColor: 'rgba(75,192,192,1)',
              backgroundColor: 'rgba(75,192,192,0.2)',
              fill: true,
              tension: 0.4
            },
            {
              data: spending.previousYear,
              label: 'Last Year',
              borderColor: 'rgba(153,102,255,1)',
              backgroundColor: 'rgba(153,102,255,0.2)',
              fill: true,
              tension: 0.4
            }
          ]
        };
      });
    }
  }
}
