import { ChangeDetectorRef, Component, Input, input, OnInit } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { AuditlogI } from 'src/app/shared/types/purchaseOrder.type';
import { PurchaseOrdersService } from 'src/app/features/purchaseOrders/purchase-orders.service';

@Component({
  selector: 'app-audit-logs',
  imports: [NgFor, NgIf, DatePipe],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.scss'
})
export class AuditLogsComponent implements OnInit {
  @Input() formHeading: string = "";
  @Input() tableRowId: number=0;
  @Input() PageId: number=0;
  auditLogs: any[] = [];
  isLoading = true;

  constructor(private purchaseOrdersService: PurchaseOrdersService,
    private changeDetectorRef:ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadAuditLogs(this.PageId,this.tableRowId);
  }

  loadAuditLogs(PageId:number,tableRowId:number): void {
    this.purchaseOrdersService.getAuditLogs(PageId,tableRowId).subscribe(
      (response) => {
        if (response.success) {
          this.auditLogs = response.data;
          this.changeDetectorRef.detectChanges();
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching audit logs:', error);
        this.isLoading = false;
      }
    );
  }
}
