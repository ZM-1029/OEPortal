import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BussinessLineComponent } from './bussiness-line.component';

describe('BussinessLineComponent', () => {
  let component: BussinessLineComponent;
  let fixture: ComponentFixture<BussinessLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BussinessLineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BussinessLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
