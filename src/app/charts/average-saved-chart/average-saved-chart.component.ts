import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { UserProfileService } from 'src/app/services/user-profile.service';

@Component({
  selector: 'app-average-saved-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './average-saved-chart.component.html',
  styleUrls: ['./average-saved-chart.component.css']
})
export class AverageSavedChartComponent implements OnInit {
  @Input() userId!: number;

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: []
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  };

  public barChartType: 'bar' = 'bar';

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit(): void {
    if (this.userId) {
      this.userProfileService.getUserProfile(this.userId).subscribe(user => {
        const savedData = user.averageSavedPerMonth;

        this.barChartData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              data: savedData,
              label: 'KM Saved',
              backgroundColor: 'rgba(255, 159, 64, 0.6)',
              borderColor: 'rgba(255, 159, 64, 1)',
              borderWidth: 1
            }
          ]
        };
      });
    }
  }
}
