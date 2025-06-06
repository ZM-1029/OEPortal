import { TestBed } from '@angular/core/testing';

import { ManageColumnStateService } from './manage-column-state.service';

describe('ManageColumnStateService', () => {
  let service: ManageColumnStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageColumnStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
