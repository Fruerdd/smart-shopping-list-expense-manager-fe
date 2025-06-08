import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverviewCardsService, OverviewDataItem} from '@app/services/overview-cards.service';

@Component({
  selector: 'app-overview-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview-cards.component.html',
  styleUrls: ['./overview-cards.component.css']
})
export class OverviewCardsComponent implements OnInit {
  overviewData: OverviewDataItem[] = [];
  selectedPeriod: 'today' | 'lastWeek' = 'today';

  constructor(private overviewCardsService: OverviewCardsService) {
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.overviewCardsService.getOverviewData(this.selectedPeriod).subscribe(data => {
      this.overviewData = data;
    });
  }

  onPeriodChangeHandler(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedPeriod = selectElement.value as 'today' | 'lastWeek';
    this.loadData();
  }
}
