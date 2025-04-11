import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IgxCategoryChartModule,
  IgxLegendModule
} from 'igniteui-angular-charts';
import { UserProfileService } from 'src/app/services/user-profile.service';

@Component({
  selector: 'app-average-price-chart',
  standalone: true,
  imports: [CommonModule, IgxCategoryChartModule, IgxLegendModule],
  templateUrl: './average-price-chart.component.html',
  styleUrls: ['./average-price-chart.component.css']
})
export class AveragePriceChartComponent implements OnInit {
  @Input() userId!: number;

  public chartData: any[] = [];
  public brushes: string[] = ['#4CAF50']; // Green color for bars
  public outlines: string[] = ['#2E7D32']; // Darker green for outlines

  constructor(private userProfileService: UserProfileService) {}

  ngOnInit(): void {
    if (this.userId) {
      this.userProfileService.getUserProfile(this.userId).subscribe({
        next: (user) => {
          const priceAverages = user.priceAverages || [];
          this.chartData = priceAverages.map((p: any) => ({
            name: p.item, // Changed from 'item' to 'name' for better label display
            value: p.price // Changed from 'price' to 'value'
          }));
        },
        error: (err) => {
          console.error('Error loading chart data:', err);
          // Fallback data if API fails
          this.chartData = [
            { name: 'Product A', value: 10.5 },
            { name: 'Product B', value: 15.2 },
            { name: 'Product C', value: 8.7 }
          ];
        }
      });
    } else {
      // Default data if no userId is provided
      this.chartData = [
        { name: 'Sample 1', value: 10 },
        { name: 'Sample 2', value: 20 }
      ];
    }
  }
}
