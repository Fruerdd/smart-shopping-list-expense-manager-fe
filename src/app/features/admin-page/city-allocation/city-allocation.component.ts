import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IgxPieChartModule, IgxPieChartComponent, IgxItemLegendModule } from "igniteui-angular-charts";
import { ChartDataService, IChartData } from "../../../services/chart-data.service";

@Component({
  selector: "app-city-allocation",
  standalone: true,
  imports: [
    CommonModule, 
    IgxPieChartModule, 
    IgxItemLegendModule],
  templateUrl: "./city-allocation.component.html",
  styleUrls: ["./city-allocation.component.scss"]
})
export class CityAllocationComponent implements OnInit, AfterViewInit {
  public data: any; 

  @ViewChild("chart", { static: true })
  public chart!: IgxPieChartComponent;

  constructor(private chartDataService: ChartDataService) {}

  ngOnInit(): void {
    this.chartDataService.getCityAllocationData().subscribe((chartData: IChartData) => {
      this.data = chartData.labels.map((label, index) => ({
        MarketShare: chartData.datasets[0].data[index],
        Company: label,
        Summary: `${label} ${chartData.datasets[0].data[index]}%`
      }));
    });
  }

  public pieSliceClickEvent(e: any): void {
    e.args.isExploded = !e.args.isExploded;
  }

  public ngAfterViewInit(): void {
    this.chart.explodedSlices.add(2);
  }
}
