import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanybanklistComponent } from './companybanklist.component';

describe('CompanybanklistComponent', () => {
  let component: CompanybanklistComponent;
  let fixture: ComponentFixture<CompanybanklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanybanklistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanybanklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
