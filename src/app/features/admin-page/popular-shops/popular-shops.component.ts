import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';

Chart.register(
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-popular-shops',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './popular-shops.component.html',
  styleUrls: ['./popular-shops.component.css']
})
export class PopularShopsComponent implements OnInit {
  isBrowser = false;

  public barChartData: ChartData<'bar'> = {
    labels: ['Bingo', 'Mercator', 'Konzum', 'BEST', 'Amko Komerc', 'Hoše Komerc'],
    datasets: [
      {
        label: 'Shops',
        data: [10, 12, 8, 14, 9, 11],
        backgroundColor: '#6c63ff'
      }
    ]
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, grace: '5%' }
    }
  };

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    console.log('PopularShops isBrowser:', this.isBrowser);
  }
}
