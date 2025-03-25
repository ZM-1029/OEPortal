import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountrytaxesComponent } from './countrytaxes.component';

describe('CountrytaxesComponent', () => {
  let component: CountrytaxesComponent;
  let fixture: ComponentFixture<CountrytaxesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountrytaxesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountrytaxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
