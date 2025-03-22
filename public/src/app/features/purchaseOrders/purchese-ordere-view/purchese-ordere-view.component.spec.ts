import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurcheseOrdereViewComponent } from './purchese-ordere-view.component';

describe('PurcheseOrdereViewComponent', () => {
  let component: PurcheseOrdereViewComponent;
  let fixture: ComponentFixture<PurcheseOrdereViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurcheseOrdereViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurcheseOrdereViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
