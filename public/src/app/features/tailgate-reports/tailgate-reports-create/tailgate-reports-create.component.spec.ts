import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TailgateReportsCreateComponent } from './tailgate-reports-create.component';

describe('TailgateReportsCreateComponent', () => {
  let component: TailgateReportsCreateComponent;
  let fixture: ComponentFixture<TailgateReportsCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TailgateReportsCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TailgateReportsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
