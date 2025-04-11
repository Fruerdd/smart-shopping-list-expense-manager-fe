import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxFinancialChartModule } from 'igniteui-angular-charts';
import { UserProfileService } from 'src/app/services/user-profile.service';

@Component({
  selector: 'app-money-spent-chart',
  standalone: true,
  imports: [CommonModule, IgxFinancialChartModule],
  templateUrl: './money-spent-chart.component.html',
  styleUrls: ['./money-spent-chart.component.css']
})
export class MoneySpentChartComponent implements OnInit {
  @Input() userId!: number;

  public chartData: any[] = [];
  public chartOptions = {
    yAxisTitle: 'Amount (KM)',
    xAxisTitle: 'Month',
    thickness: 2,
    isVerticalZoomEnabled: false,
    isHorizontalZoomEnabled: false
  };

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit(): void {
    if (this.userId) {
      this.userProfileService.getUserProfile(this.userId).subscribe(user => {
        const spending = user.spendingOverTime || {};

        // Prepare data in IgniteUI format
        this.chartData = [
          {
            name: 'This Year',
            values: this.createMonthlyData(spending.currentYear)
          },
          {
            name: 'Last Year',
            values: this.createMonthlyData(spending.previousYear)
          }
        ];
      });
    }
  }

  private createMonthlyData(amounts: number[]): any[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      month: month,
      amount: amounts[index] || 0
    }));
  }
}
