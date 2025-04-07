import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-money-spent-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './money-spent-chart.component.html',
  styleUrls: ['./money-spent-chart.component.css']
})
export class MoneySpentChartComponent implements OnChanges {
  @Input() spendingOverTime: { currentYear: number[]; previousYear: number[] } | null = null;

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: []
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true
  };

  public lineChartType: 'line' = 'line';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['spendingOverTime'] && this.spendingOverTime) {
      this.lineChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            data: this.spendingOverTime.currentYear,
            label: 'This Year',
            borderColor: 'rgba(75,192,192,1)',
            backgroundColor: 'rgba(75,192,192,0.2)',
            fill: true,
            tension: 0.4
          },
          {
            data: this.spendingOverTime.previousYear,
            label: 'Last Year',
            borderColor: 'rgba(153,102,255,1)',
            backgroundColor: 'rgba(153,102,255,0.2)',
            fill: true,
            tension: 0.4
          }
        ]
      };
    }
  }
}
