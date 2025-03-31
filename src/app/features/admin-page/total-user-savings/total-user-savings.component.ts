import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-total-user-savings',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './total-user-savings.component.html',
  styleUrls: ['./total-user-savings.component.css']
})
export class TotalUserSavingsComponent {
  // Fake data
  public barChartData: ChartData<'bar'> = {
    labels: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 
      'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    datasets: [
      {
        label: 'Savings (BAM)',
        data: [300, 450, 500, 600, 700, 650, 800, 900, 850, 950, 1000, 1100],
        backgroundColor: '#6c63ff' 
      }
    ]
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
}
