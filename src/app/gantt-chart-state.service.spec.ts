import { TestBed } from '@angular/core/testing';

import { GanttChartStateService } from './gantt-chart-state.service';

describe('GanttChartStateService', () => {
  let service: GanttChartStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GanttChartStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
