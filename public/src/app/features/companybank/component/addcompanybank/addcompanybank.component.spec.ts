import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddcompanybankComponent } from './addcompanybank.component';

describe('AddcompanybankComponent', () => {
  let component: AddcompanybankComponent;
  let fixture: ComponentFixture<AddcompanybankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddcompanybankComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddcompanybankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
