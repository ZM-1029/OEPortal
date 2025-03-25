import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBussinessComponent } from './add-bussiness.component';

describe('AddBussinessComponent', () => {
  let component: AddBussinessComponent;
  let fixture: ComponentFixture<AddBussinessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBussinessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBussinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
