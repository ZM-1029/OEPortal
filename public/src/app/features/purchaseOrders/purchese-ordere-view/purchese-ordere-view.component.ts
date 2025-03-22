import { DatePipe } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { InvoiceService } from '../../invoice/invoice.service';

@Component({
  selector: 'app-purchese-ordere-view',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './purchese-ordere-view.component.html',
  styleUrl: './purchese-ordere-view.component.scss',
   providers: [ DatePipe],
})
export class PurcheseOrdereViewComponent {
    purchaseOrderId: string = '';
    purchaseOrderAmount: number = 0;
    purchaseOrderRemainingAmount: number = 0;
    purchaseOrderMonth: any;
    purchaseOrderYear: any;
    transactions: any[] = [];
    public showPurchaseOrder: boolean = false;
 constructor(
    public viewPurchseOrderdialogRef: MatDialogRef<PurcheseOrdereViewComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: string, private invoiceService: InvoiceService, private datePipe:DatePipe
  ) {}

  
  ngOnInit(): void {
    this.purchaseOrderId = this.data;
    this.getPOSummaryByPoId(this.purchaseOrderId)
  }
  getPOSummaryByPoId(id:string){
    this.invoiceService.getPOSummaryByPoId(id).subscribe({
      next:((response)=>{
        if(response.success){
        this.purchaseOrderAmount=response.data.amount;
        this.purchaseOrderRemainingAmount=response.data.remainingAmount;
        this.purchaseOrderMonth=response.data.poDate;
        this.purchaseOrderYear=response.data.poDate;
        this.transactions=response.data.transactions;
        }else{
          console.log(`PurcheseOrdereViewComponent getPOSummaryByPoId, ${response}`);  
        }
      }),
      error:((err)=>{
        console.log(`PurcheseOrdereViewComponent getPOSummaryByPoId, ${err}`);    
      })
    })
  }
 
  getDate(formatDate: any, format: string = "dd-MM-YYYY"): string | null {
    return this.datePipe.transform(formatDate, format);
  }
  getMonth(formatDate: any, format: string = "MM"): string | null {
    return this.datePipe.transform(formatDate, format);
  }
  getYear(formatDate: any, format: string = "YYYY"): string | null {
    return this.datePipe.transform(formatDate, format);
  }
  
  confirmClose(): void {
    this.viewPurchseOrderdialogRef.close(true);
  }


}
