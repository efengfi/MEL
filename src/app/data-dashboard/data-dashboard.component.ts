import { Component } from '@angular/core';
// some comment
@Component({
  selector: 'app-data-dashboard',
  templateUrl: './data-dashboard.component.html',
  styleUrls: ['./data-dashboard.component.css']
})
export class DataDashboardComponent {
  activeTab: string = 'gantt-chart';

  selectTab(tab: string) {
    this.activeTab = tab;
  }
}
