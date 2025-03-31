import { TestBed } from '@angular/core/testing';

import { CompanybanklistService } from './companybanklist.service';

describe('CompanybanklistService', () => {
  let service: CompanybanklistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanybanklistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
