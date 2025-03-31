import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overview-cards',
  imports: [CommonModule],
  templateUrl: './overview-cards.component.html',
  styleUrls: ['./overview-cards.component.css'],
  standalone: true  
})
export class OverviewCardsComponent {
  // Fake
  overviewData = [
    { title: 'Views', value: 7265, change: '+10%' },
    { title: 'Visits', value: 3671, change: '-5%' },
    { title: 'New Users', value: 156, change: '-10%' },
    { title: 'Active Users', value: 2318, change: '+3%' }
  ];
}
