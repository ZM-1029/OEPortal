import { TestBed } from '@angular/core/testing';

import { TailgateReportsService } from './tailgate-reports.service';

describe('TailgateReportsService', () => {
  let service: TailgateReportsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TailgateReportsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
