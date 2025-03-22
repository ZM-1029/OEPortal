import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceCreateTableComponent } from './invoice-create-table.component';

describe('InvoiceCreateTableComponent', () => {
  let component: InvoiceCreateTableComponent;
  let fixture: ComponentFixture<InvoiceCreateTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceCreateTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceCreateTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
