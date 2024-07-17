import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDashboardComponent } from './data-dashboard.component';

describe('DataDashboardComponent', () => {
  let component: DataDashboardComponent;
  let fixture: ComponentFixture<DataDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataDashboardComponent]
    });
    fixture = TestBed.createComponent(DataDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
