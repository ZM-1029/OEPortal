import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EfficiencyReportsComponent } from './efficiency-reports.component';

describe('EfficiencyReportsComponent', () => {
  let component: EfficiencyReportsComponent;
  let fixture: ComponentFixture<EfficiencyReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EfficiencyReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EfficiencyReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
