import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxCategoryChartModule } from 'igniteui-angular-charts';
import { UserProfileService } from 'src/app/services/user-profile.service';

@Component({
  selector: 'app-category-spending-chart',
  standalone: true,
  imports: [CommonModule, IgxCategoryChartModule],
  templateUrl: './category-spending-chart.component.html',
  styleUrls: ['./category-spending-chart.component.css']
})
export class CategorySpendingChartComponent implements OnInit {
  @Input() userId!: number;

  public chartData: any[] = [];
  public brushes: string[] = ['rgba(75, 192, 192, 0.8)'];
  public outlines: string[] = ['rgba(75, 192, 192, 1)'];

  public chartOptions = {
    yAxisTitle: 'Amount (KM)',
    xAxisTitle: 'Categories',
    yAxisLabelLeftMargin: 5,
    xAxisLabelTopMargin: 5
  };

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit(): void {
    if (this.userId) {
      this.userProfileService.getUserProfile(this.userId).subscribe(user => {
        const spending = user.categorySpending || [];

        this.chartData = spending.map((c: any) => ({
          category: c.category,
          amount: c.amount
        }));
      });
    }
  }
}
