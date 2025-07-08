import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TailgateReportsComponent } from './tailgate-reports.component';

describe('TailgateReportsComponent', () => {
  let component: TailgateReportsComponent;
  let fixture: ComponentFixture<TailgateReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TailgateReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TailgateReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
