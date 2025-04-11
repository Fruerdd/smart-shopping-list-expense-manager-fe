import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxCategoryChartModule } from 'igniteui-angular-charts';
import { UserProfileService } from 'src/app/services/user-profile.service';

@Component({
  selector: 'app-average-saved-chart',
  standalone: true,
  imports: [CommonModule, IgxCategoryChartModule],
  templateUrl: './average-saved-chart.component.html',
  styleUrls: ['./average-saved-chart.component.css']
})
export class AverageSavedChartComponent implements OnInit {
  @Input() userId!: number;

  public chartData: any[] = [];
  public brushes: string[] = ['rgba(255, 159, 64, 0.8)'];
  public outlines: string[] = ['rgba(255, 159, 64, 1)'];

  public chartOptions = {
    yAxisTitle: 'Amount Saved (KM)',
    xAxisTitle: 'Month',
  };

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit(): void {
    if (this.userId) {
      this.userProfileService.getUserProfile(this.userId).subscribe(user => {
        const savedData = user.averageSavedPerMonth;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

        this.chartData = months.map((month, index) => ({
          month: month,
          saved: savedData[index] || 0
        }));
      });
    }
  }
}
