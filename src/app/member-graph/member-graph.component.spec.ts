import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberGraphComponent } from './member-graph.component';

describe('MemberGraphComponent', () => {
  let component: MemberGraphComponent;
  let fixture: ComponentFixture<MemberGraphComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemberGraphComponent]
    });
    fixture = TestBed.createComponent(MemberGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
