import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveQuatationComponent } from './approve-quatation.component';

describe('ApproveQuatationComponent', () => {
  let component: ApproveQuatationComponent;
  let fixture: ComponentFixture<ApproveQuatationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveQuatationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveQuatationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
