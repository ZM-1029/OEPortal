import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthMultiSelectDropdownComponent } from './month-multi-select-dropdown.component';

describe('MonthMultiSelectDropdownComponent', () => {
  let component: MonthMultiSelectDropdownComponent;
  let fixture: ComponentFixture<MonthMultiSelectDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthMultiSelectDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthMultiSelectDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
