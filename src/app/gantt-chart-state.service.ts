import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GanttChartStateService {
  memberIdFilterValue: string = '';
  householdIdFilterValue: string = '';
  startDateValue: string = '';
  endDateValue: string = '';
  taskFilterValue: string = 'all';
  channelFilterValue: any;
  fraudFilterValue: any;
}
