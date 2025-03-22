import { ChangeDetectorRef, Component, OnInit, } from "@angular/core";
import { CustomersService } from "../../customers/customers.service";
import { InvoiceService } from "../invoice.service";
import { InvoiceCreateTableComponent } from "./invoice-create-table/invoice-create-table.component";
import { invoiceCreateTableI, invoiceEditDataI, invoiceEditI } from "src/app/shared/types/invoice.type";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SuccessModalComponent } from "src/app/shared/components/UI/success-modal/success-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { InvoiceFormComponent } from "../invoice-ui/invoice-form/invoice-form.component";
import { ActivatedRoute, Router } from "@angular/router";


@Component({
  selector: "app-invoice-create",
  imports: [
    InvoiceFormComponent,
    InvoiceCreateTableComponent
  ],
  templateUrl: "./invoice-create.component.html",
  styleUrl: "./invoice-create.component.scss",

})
export class InvoiceCreateComponent implements OnInit {
  invoiceTransition: boolean = false;
  invoiceTableData: invoiceCreateTableI[] = [];
  validatedInvoiceTableData: invoiceCreateTableI[] = [];
  invoiceForm: any;
  totalBuilldAmount: number = 0;
  purchaseOrder: any;
  isFormValidate: boolean = false;
  invoiceId: any;
  editedInvoicedata: any;

  constructor(private _successMessage: MatSnackBar, private dialog: MatDialog,
    private invoiceService: InvoiceService, private _changeDetectorRef: ChangeDetectorRef,
    private _router: Router, private route: ActivatedRoute,) {
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      if (params.invoiceId != undefined) {
        this.invoiceId = Number(params.invoiceId);
        this.getInvoiceById(this.invoiceId);
      }
    });
  }

  InvoiceformData(data: any) {
    this.invoiceForm = data
    this.createCustomerInvoiceTable();
  }

  // show table start
  createCustomerInvoiceTable(): void {
    if (Object.keys(this.invoiceForm).length > 0) {
      this.invoiceService.getSalaryByCustomerId(this.invoiceForm.customerId, this.invoiceForm.month, this.invoiceForm.year).subscribe(
        {
          next: (
            (response: any) => {
              if (response.success) {
                this.invoiceTableData = response.data;
              } else {
                this.invoiceTableData = [];
              }
            }
          ), error: ((error) => {
            console.log(error, "Data not avaliable:");
          }
          )
        }
      )
    }
  }
  // show table end


  // Create or Edit Invoice
  createInvoice(rowData: any) {
    const employeeInvoices = rowData.map((row: any) => ({
      employeeId: row.employeeID,
      salary: row.salary,
      billedAmount: Number(row.billedAmount),
      currencyId: row.currencyId
    }));

    let invoiceData: any = {
      invoiceNumber: this.invoiceForm?.invoiceNumber,
      year: this.invoiceForm?.year,
      month: this.invoiceForm?.month,
      customerId: this.invoiceForm?.customerId,
      employeeInvoices: employeeInvoices
    };

    console.log(invoiceData, "Processing...", this.invoiceId);

    if (this.invoiceId) {
      // Call Edit API if invoiceId exists
      invoiceData.id = this.invoiceId;
      invoiceData.year = Number(invoiceData.year);
      invoiceData.month = Number(invoiceData.month);
      // invoiceData.id = this.invoiceId; 
      this.invoiceService.updateInvoiceById(this.invoiceId, invoiceData).subscribe({
        next: (response) => {
          if (response.success) {
            this.createPoTransation(this.invoiceId);
            this.showSuccessMessage("Invoice updated successfully");
            this._router.navigateByUrl("/admin/invoice");
          } else {
            this.handleError(response.message);
            this.isFormValidate = false;
          }
        },
        error: (error) => {
          this.handleError(error.error.message);
          this.isFormValidate = false;
          console.log(error);
        }
      });
    } else {
      // Call Create API if invoiceId does not exist
      this.invoiceService.createInvoice(invoiceData).subscribe({
        next: (response) => {
          if (response.success) {
            this.createPoTransation(response.invoiceId);
            this.showSuccessMessage("Invoice created successfully");
            this._router.navigateByUrl("/admin/invoice");
          } else {
            this.handleError(response.message);
            this.isFormValidate = false;
          }
        },
        error: (error) => {
          this.handleError(error.error.message);
          this.isFormValidate = false;
          console.log(error);
        }
      });
    }
  }

  // Create Invoice end
  // Create purchase order start
  createPoTransation(invoiceId: number) {
    if (this.totalBuilldAmount != 0 && this.purchaseOrder?.poStatus) {
      console.log(this.invoiceForm,);
      const poTransation = {
        poId: this.purchaseOrder?.poNumber,
        transactionAmount: this.totalBuilldAmount,
        transactionDate: new Date().toISOString(),
        invoiceId: invoiceId
      }
      this._changeDetectorRef.detectChanges();
      this.invoiceService.createPurchaseOrderTransaction(poTransation).subscribe(
        {
          next: ((response) => {
            if (response.success) {
              this.showSuccessMessage(response.message)
            } else {
              this.handleError(response.message)
            }
          }
          ),
          error: ((error) => {
            this.handleError(error)
            console.log(error);
          })
        }
      )
    }
  }
  // Create purchase order start

  purchaseOrderData(data: any) {
    console.log(data);
    this.purchaseOrder = data; 
    this._changeDetectorRef.detectChanges();   
  }

  formSubmit(event: boolean) {
    if (event == true) {
      this.isFormValidate = true;
    } else {
      this.isFormValidate = false;
    }
  }

  invoiceValidFormData(data: any) {
    // this.isFormValidate = false;
    if (data.invoiceformData.invoiceNumber !== '') {
      if (data.status && this.validatedInvoiceTableData.length !== 0) {
        this.invoiceForm = data.invoiceformData
        console.log(this.validatedInvoiceTableData, this.purchaseOrder, this.totalBuilldAmount, "totalBuilldAmount");
        if (this.purchaseOrder == undefined) {
          this.createInvoice(this.validatedInvoiceTableData);
        }
        if (this.purchaseOrder.poStatus) {
          if (this.invoiceId) {
            if (this.purchaseOrder.purchaseOrderFormData.transactions.length == 0) {
              if (this.purchaseOrder.purchaseOrderFormData.purchaseOrderRemainingAmount - this.totalBuilldAmount >= 0) {
                this.createInvoice(this.validatedInvoiceTableData);
              } else {
                this.isFormValidate = false;
                this.handleError(`There is no enough amount in Purchase Order`)
              }
            } else {
              for (const poData of this.purchaseOrder.purchaseOrderFormData.transactions) {
                if (poData.invoiceNumber == data.invoiceformData.invoiceNumber) {
                  const sumOfPurchsaeAmount = this.purchaseOrder.purchaseOrderFormData.purchaseOrderRemainingAmount + poData.transactionAmount;
                  if (sumOfPurchsaeAmount - this.totalBuilldAmount >= 0) {
                    this.createInvoice(this.validatedInvoiceTableData);
                  } else {
                    this.isFormValidate = false;
                    this.handleError(`There is no enough amount in Purchase Order`)
                  }
                } else {
                  if (this.purchaseOrder.purchaseOrderFormData.purchaseOrderRemainingAmount - this.totalBuilldAmount >= 0) {
                    this.createInvoice(this.validatedInvoiceTableData);
                  } else {
                    this.isFormValidate = false;
                    this.handleError(`There is no enough amount in Purchase Order`)
                  }
                }
              }
            }
          } else {
            if (this.purchaseOrder.purchaseOrderFormData.purchaseOrderRemainingAmount - this.totalBuilldAmount >= 0) {
              this.createInvoice(this.validatedInvoiceTableData);
            } else {
              this.isFormValidate = false;
              this.handleError(`There is no enough amount in Purchase Order`)
            }
          }
        }
      } else {
        this.isFormValidate = false;
        this.handleError(`Please correct the Invoice Table`);
      }
    } else {
      this.isFormValidate = false;
      this.handleError(`Please enter the Invoice ID`)
    }

  }

  // From Invoice create table
  ValidTableData(event: { rowData: any[]; totalSum: number }) {
    // this.isFormValidate = !this.isFormValidate ;
    this.totalBuilldAmount = event.totalSum;
    this.validatedInvoiceTableData = event.rowData
    this._changeDetectorRef.detectChanges();
  }

  backToInvoiceList() {
    this._router.navigateByUrl("/admin/invoice");
  }

  // From Invoice create table

  // Invoice Edit start
  getInvoiceById(id: any) {
    console.log(id, "id getInvoiceById");
    if (id !== 0) {
      this.invoiceService.getInvoiceById(id).subscribe(
        {
          next: ((response) => {
            this.editedInvoicedata = response.data
            console.log(response);
          }), error: ((err) => {
            console.log(err);
          })
        }
      )
    }
  }
  // Invoice Edit end

  //  Function to show success messages
  private showSuccessMessage(message: string) {
    this._successMessage.openFromComponent(SuccessModalComponent, {
      data: { message },
      duration: 4000,
      panelClass: ["custom-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }

  //  Function to handle API errors
  private handleError(err: any) {
    this._successMessage.open(err, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }
}
