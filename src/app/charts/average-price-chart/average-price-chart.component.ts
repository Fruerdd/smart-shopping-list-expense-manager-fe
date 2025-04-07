import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-average-price-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './average-price-chart.component.html',
  styleUrls: ['./average-price-chart.component.css']
})
export class AveragePriceChartComponent implements OnChanges {
  @Input() priceAverages: { item: string; price: number }[] = [];

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    indexAxis: 'y', // za horizontalni bar, izbriši ovu liniju ako želiš vertikalni
    plugins: {
      legend: { display: false }
    }
  };

  public barChartType: 'bar' = 'bar';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['priceAverages'] && this.priceAverages?.length) {
      this.barChartData = {
        labels: this.priceAverages.map(p => p.item),
        datasets: [
          {
            data: this.priceAverages.map(p => p.price),
            label: 'Avg. Price (KM)',
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }
        ]
      };
    }
  }
}
