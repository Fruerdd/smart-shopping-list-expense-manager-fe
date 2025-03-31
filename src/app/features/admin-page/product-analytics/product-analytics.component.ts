import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-product-analytics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './product-analytics.component.html',
  styleUrls: ['./product-analytics.component.css']
})
export class ProductAnalyticsComponent {
  // Fake data
  public pieChartData: ChartData<'pie'> = {
    labels: ['Sarejevo', 'Mostar', 'Tuzla', 'Zenica', 'Banja Luka'],
    datasets: [
      {
        data: [25, 20, 15, 25, 15],
        backgroundColor: ['#f94144', '#f3722c', '#f9c74f', '#43aa8b', '#577590']
      }
    ]
  };

  get pieChartBackgroundColors(): string[] {
    return (this.pieChartData.datasets[0]?.backgroundColor as string[]) || [];
  }

  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  public barChartData: ChartData<'bar'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Products Added',
        data: [10, 14, 12, 18, 16],
        backgroundColor: '#6a4c93'
      }
    ]
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Fake data 
  topProducts = [
    { rank: 1, productName: 'Tomato "Roma"', price: 1.99, store: 'Mercator' },
    { rank: 2, productName: 'Banana "Baby"', price: 2.49, store: 'Bingo' },
    { rank: 3, productName: 'Lettuce "Iceberg"', price: 0.99, store: 'Konzum' },
    { rank: 4, productName: 'Carrot "Organic"', price: 1.29, store: 'BEST' },
    { rank: 5, productName: 'Potato "Russet"', price: 1.59, store: 'Amko Komerc' }
  ];
}
