import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { UserProfileService } from 'src/app/services/user-profile.service';

@Component({
  selector: 'app-average-price-chart',
  standalone: true,
  imports: [CommonModule,BaseChartDirective],
  templateUrl: './average-price-chart.component.html',
  styleUrls: ['./average-price-chart.component.css']
})
export class AveragePriceChartComponent implements OnInit {
  @Input() userId!: number;

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    indexAxis: 'y', // ukloni ako želiš vertikalni graf
    plugins: {
      legend: { display: false }
    }
  };

  public barChartType: 'bar' = 'bar';

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit(): void {
    if (this.userId) {
      this.userProfileService.getUserProfile(this.userId).subscribe(user => {
        const priceAverages = user.priceAverages;
        this.barChartData = {
          labels: priceAverages.map((p: any) => p.item),
          datasets: [
            {
              data: priceAverages.map((p: any) => p.price),
              label: 'Avg. Price (KM)',
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }
          ]
        };
      });
    }
  }
}
