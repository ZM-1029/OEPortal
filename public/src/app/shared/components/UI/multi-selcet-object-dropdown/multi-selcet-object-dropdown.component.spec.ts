import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSelcetObjectDropdownComponent } from './multi-selcet-object-dropdown.component';

describe('MultiSelcetObjectDropdownComponent', () => {
  let component: MultiSelcetObjectDropdownComponent;
  let fixture: ComponentFixture<MultiSelcetObjectDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSelcetObjectDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiSelcetObjectDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
