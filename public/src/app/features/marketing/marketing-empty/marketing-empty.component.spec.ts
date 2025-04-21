import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketingEmptyComponent } from './marketing-empty.component';

describe('MarketingEmptyComponent', () => {
  let component: MarketingEmptyComponent;
  let fixture: ComponentFixture<MarketingEmptyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketingEmptyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketingEmptyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
