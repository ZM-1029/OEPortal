import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-purchase-order',
  imports: [NgClass],
  templateUrl: './purchase-order.component.html',
  styleUrl: './purchase-order.component.scss'
})
export class PurchaseOrderComponent implements OnInit, OnChanges {
  @Input() purchaseOrderData: any;
  purchaseOrderId: string = '';
  purchaseOrderAmount: number = 0;
  purchaseOrderRemainingAmount: number = 0;
  purchaseOrderMonth: any;
  purchaseOrderYear: any;
  transactions: any[] = [];
  public showPurchaseOrder: boolean = false;
  constructor(private _changeDetectorRef: ChangeDetectorRef, private datePipe: DatePipe,
  ) { }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['purchaseOrderData'] && changes['purchaseOrderData'].currentValue) {
      console.log(this.purchaseOrderData, "PurchaseOrderComponent ngOnChanges heare you get");
      this.purchaseOrderId = this.purchaseOrderData?.poNumber;
      this.purchaseOrderAmount=this.purchaseOrderData.purchaseOrderAmount
      this.purchaseOrderRemainingAmount=this.purchaseOrderData.purchaseOrderRemainingAmount
      this.purchaseOrderMonth=this.purchaseOrderData.purchaseOrderMonth
      this.purchaseOrderYear=this.purchaseOrderData.purchaseOrderYear
      this.transactions=this.purchaseOrderData.transactions
      this._changeDetectorRef.detectChanges();
    }
  }

  getDate(formatDate: any, format: string = "dd-MM-YYYY"): string | null {
    return this.datePipe.transform(formatDate, format);
  }

}




