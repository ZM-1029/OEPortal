import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SalesService } from '../sales.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgClass } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { LoaderComponent } from 'src/app/shared/components/UI/loader/loader.component';
import { SideDrawerComponent } from 'src/app/shared/components/UI/side-drawer/side-drawer.component';
import { AuditLogsComponent } from 'src/app/shared/components/UI/audit-logs/audit-logs.component';

// import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// // Set worker path
// pdfjsLib.GlobalWorkerOptions.workerSrc = 
//   'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// // Optional: remove dynamic import warning (older versions only)
// pdfDefaultOptions.workerSrc = pdfjsLib.GlobalWorkerOptions.workerSrc;

@Component({
  selector: 'app-approve-quatation',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    PdfViewerModule,
    MatCheckboxModule,
    NgClass,
    MatCardModule,
    LoaderComponent,
    SideDrawerComponent,
    AuditLogsComponent
  ],
  templateUrl: './approve-quatation.component.html',
  styleUrl: './approve-quatation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApproveQuatationComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  approveForm!: FormGroup;
  selectedFile: File | null = null;
  errorMessage: string = '';
  showFileUpload: boolean = false;
  isSelfApproved: boolean = false;
  quotationStatus: any[] = [];
  quotationStatusId: number = 0;
  pdfUrl: string | null = null;
  pdfSrc: string | undefined;
  roleId: number = 0;
  @Input() isApprovePopupOpen: boolean = false;
  @Input() Id: number = 0;
  @Output() formClose = new EventEmitter<boolean>();
  invoiceUrl: string = '';
  page: number = 1;         // current page number
  totalPages: number = 0;   // total pages in the PDF
  zoom: number = 0.7;
  fileUploadError: string = '';
  selectedFileName: string = '';

  public isAuditlogOpen: boolean = false;
  tableRowId: number = 0;

  private subscriptions = new Subscription();
  constructor(private sanitizer: DomSanitizer, private fb: FormBuilder, private _salesService: SalesService,
    private _successMessage: MatSnackBar, private cdr: ChangeDetectorRef, private _router: Router,
    private activatedRoute: ActivatedRoute) {
    this.createForm();
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.tableRowId=+id;
        this.Id = +id;
        this.isLoading = true;
        this.getQuotationById(this.Id);
        this.getQuotationStatus(this.Id);
        this.getQuotationDetails(this.Id);
        this.downloadPDF();
      }
    });
    this.roleId = Number(localStorage.getItem('role'));
  }

  // ngOnInit(): void {
  //   this.isLoading = true;
  //   this.getQuotationById(this.Id);
  //   this.getQuotationStatus(this.Id);
  //   this.getQuotationDetails(this.Id);
  //   this.downloadPDF();
  // }

  // for btn ui start
  toggleApproval(primaryKey: string, oppositeKey: string): void {
    const currentVal = this.approveForm.get(primaryKey)?.value;
    this.approveForm.get(primaryKey)?.setValue(!currentVal);
    if (!currentVal) {
      this.approveForm.get(oppositeKey)?.setValue(false, { emitEvent: false });
    }
  }

  // for btn ui end

  private handleError(err: any) {
    this._successMessage.open(err.error.message, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }

  // PDF function  start
  onPdfLoad(pdf: any): void {
    this.totalPages = pdf._pdfInfo.numPages;
  }

  zoomIn(): void {
    if (this.zoom < 2.5) this.zoom += 0.1;
  }

  zoomOut(): void {
    if (this.zoom > 0.3) this.zoom -= 0.1;
  }

  downloadQuotationPdf() {
    if (this.pdfSrc) {
      const link = document.createElement('a');
      link.href = this.pdfSrc;
      link.download = 'Quotation.pdf';
      link.click();
    } else {
      console.warn('PDF source is undefined');
    }
  }


  getQuotationById(quotationId: number) {
    this._salesService.getQuotationById(quotationId).subscribe(
      {
        next: ((response) => {
          this.quotationStatusId = response.data.statusId;
        }), error: ((error) => {
          console.warn('quotationStatusId is undefined');
        })
      }
    )
  }

  // PDF function  end

  getQuotationDetails(quotationId: number) {
    this._salesService.getQuotationStatusDetails(quotationId).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          // const isSelfApproved = response.data.isSelfApproved || false;
          this.isSelfApproved = response.data.isSelfApproved || false;
          const isApprovedByAccountant = response.data.isApprovedByAccountant || false;
          const invoice = response.data.invoice || null;
          // this.approveForm.patchValue({
          //   selfApprove: this.isSelfApproved,
          //   approveByAccountant: isApprovedByAccountant,
          // });
          if (this.quotationStatusId == 5) {
            if (!this.isSelfApproved && !isApprovedByAccountant) {
              this.approveForm.patchValue({
                selfApprove: this.isSelfApproved,
                approveByAccountant: isApprovedByAccountant,
                isApproveByAccountantDecline: false,
                isSelfApprovelDecline: true,
              }, { emitEvent: false });
            } else if (this.isSelfApproved && !isApprovedByAccountant) {
              this.approveForm.patchValue({
                selfApprove: this.isSelfApproved,
                approveByAccountant: isApprovedByAccountant,
                isSelfApprovelDecline: false,
                isApproveByAccountantDecline: true,
              }, { emitEvent: false });
            }
            else {
              this.approveForm.patchValue({
                selfApprove: this.isSelfApproved,
                approveByAccountant: isApprovedByAccountant,
                isSelfApprovelDecline: false,
                isApproveByAccountantDecline: true,
              }, { emitEvent: false });
            }
          } else {
            this.approveForm.patchValue({
              selfApprove: this.isSelfApproved,
              approveByAccountant: isApprovedByAccountant,
            }, { emitEvent: false });
          }

          if (invoice) {
            this.invoiceUrl = invoice;
            console.log(this.invoiceUrl, 'this.invoiceUrl');
          }
          const approveByAccountantControl = this.approveForm.get('approveByAccountant');
          if (this.isSelfApproved) {
            approveByAccountantControl?.enable();
          } else {
            approveByAccountantControl?.disable();
          }
          this.showFileUpload = isApprovedByAccountant;
        }
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  getQuotationStatus(quotationId: number) {
    this._salesService.getQuotationStatus(quotationId).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.quotationStatus = response.data;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  createForm() {
    this.approveForm = this.fb.group({
      selfApprove: [false],
      approveByAccountant: [false],
      isSelfApprovelDecline: [false],
      isApproveByAccountantDecline: [false],
      file: [null]
    });


    const sub1 = this.approveForm.get('selfApprove')?.valueChanges.subscribe((approved: boolean) => {
      if (approved) {
        this.approveForm.get('isSelfApprovelDecline')?.setValue(false, { emitEvent: false });
      }
    });

    const sub2 = this.approveForm.get('isSelfApprovelDecline')?.valueChanges.subscribe((declined: boolean) => {
      if (declined) {
        this.approveForm.get('selfApprove')?.setValue(false, { emitEvent: false });
      }
    });

    const sub3 = this.approveForm.get('approveByAccountant')?.valueChanges.subscribe((approved: boolean) => {
      if (approved) {
        this.approveForm.get('isApproveByAccountantDecline')?.setValue(false, { emitEvent: false });
      }
    });
    const sub4 = this.approveForm.get('isApproveByAccountantDecline')?.valueChanges.subscribe((declined: boolean) => {
      if (declined) {
        this.approveForm.get('approveByAccountant')?.setValue(false, { emitEvent: false });
      }
    });

    if (sub1) this.subscriptions.add(sub1);
    if (sub2) this.subscriptions.add(sub2);

    if (sub3) this.subscriptions.add(sub3);
    if (sub4) this.subscriptions.add(sub4);
  }


  // onFileChange(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  //     if (allowedTypes.includes(file.type)) {
  //       this.selectedFile = file;
  //       this.approveForm.patchValue({ file: file });
  //       this.errorMessage = '';
  //     } else {
  //       this.selectedFile = null;
  //       this.errorMessage = 'Only PDF and image files (JPEG, PNG) are allowed.';
  //       event.target.value = '';
  //     }
  //   }
  // }


  onFileChange(event: any) {
    const file = event.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const fullName = file.name;
    const maxLength = 10;
    this.selectedFileName = fullName.length > maxLength
      ? fullName.substring(0, maxLength) + '...'
      : fullName;
    if (file) {
      if (allowedTypes.includes(file.type)) {
        this.selectedFile = file;
        this.approveForm.patchValue({ file: file });
        this.errorMessage = '';

        // Clear required error if file is now uploaded
        if (this.approveForm.value.approveByAccountant) {
          this.fileUploadError = '';
        }
      } else {
        this.selectedFile = null;
        this.approveForm.patchValue({ file: null });
        this.errorMessage = 'Only PDF and image files (JPEG, PNG) are allowed.';
        this.fileUploadError = '';
        event.target.value = '';
      }
    }
  }


  // downloadPDF(): void {
  //   this._salesService.downloadPDF(this.Id).subscribe({
  //     next: (response: any) => {
  //       const blob = new Blob([response], { type: 'application/pdf' });
  //       const url = window.URL.createObjectURL(blob);
  //       this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  //       console.log(this.pdfSrc)
  //       this.isLoading = false;
  //       this.cdr.detectChanges()
  //     },
  //     error: (error) => {
  //       this._successMessage.open(error, 'Close', {
  //         duration: 3000,
  //         panelClass: ['error-toast'],
  //       });
  //       this.isLoading = false;
  //     },
  //   });
  // }

  downloadPDF(): void {
    this._salesService.downloadPDF(this.Id).subscribe({
      next: (response: any) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        this.pdfSrc = url;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this._successMessage.open(error.error.message || 'Quotation could not be downloaded', 'Close', {
            duration: 3000,
            verticalPosition: "top",
            horizontalPosition: "right",
          });
        this.isLoading = false;
      },
    });
  }


  reset() {
    this.approveForm.reset();
    this.selectedFile = null;
  }

  submitForm() {
    if (this.approveForm.valid) {
      const formDataSelfApproved = new FormData();
      const formDataApprovedByAccountant = new FormData();
      // formData.append('IsSelfApproved', this.approveForm.value.selfApprove);
      // formData.append('IsApprovedByAccountant', this.approveForm.value.approveByAccountant==undefined?'false':'true');

      // formData.append('Invoice', this.selectedFile ? this.selectedFile : '');
      if (this.approveForm.value.isSelfApprovelDecline) {
        formDataSelfApproved.append('QuotationId', this.Id.toString());
        formDataSelfApproved.append('IsSelfApproved', 'false');
        formDataSelfApproved.append('IsApprovedByAccountant', 'false');
        formDataSelfApproved.append('IsDeclined', this.approveForm.value.isSelfApprovelDecline ? 'true' : 'false');
        this.approveQuotation(formDataSelfApproved);
      }
      else if (this.approveForm.value.isApproveByAccountantDecline) {
        formDataApprovedByAccountant.append('QuotationId', this.Id.toString());
        formDataApprovedByAccountant.append('IsSelfApproved', this.approveForm.value.selfApprove ? 'true' : 'false');
        formDataApprovedByAccountant.append('IsApprovedByAccountant', this.approveForm.value.approveByAccountant ? 'true' : 'false');
        formDataApprovedByAccountant.append('IsDeclined', 'true');
        this.approveQuotation(formDataApprovedByAccountant);
      }
      else if (this.approveForm.value.approveByAccountant) {
        if (!this.selectedFile) {
          this.fileUploadError = 'Please upload a valid file before approval.';
          return;
        }

        this.fileUploadError = '';

        formDataApprovedByAccountant.append('QuotationId', this.Id.toString());
        formDataApprovedByAccountant.append('IsSelfApproved', this.approveForm.value.selfApprove ? 'true' : 'false');
        formDataApprovedByAccountant.append('IsApprovedByAccountant', 'true');
        formDataApprovedByAccountant.append('IsDeclined', 'false');
        formDataApprovedByAccountant.append('Invoice', this.selectedFile);

        this.approveQuotation(formDataApprovedByAccountant);
      }
      else {
        formDataSelfApproved.append('QuotationId', this.Id.toString());
        formDataSelfApproved.append('IsSelfApproved', this.approveForm.value.selfApprove ? 'true' : 'false');
        formDataSelfApproved.append('IsApprovedByAccountant', this.approveForm.value.approveByAccountant ? 'true' : 'false');
        formDataSelfApproved.append('IsDeclined', 'false');
        this.approveQuotation(formDataSelfApproved);
      }
    } else {
      this.approveForm.markAllAsTouched();
    }
  }

  approveQuotation(formData: FormData) {
    this._salesService.approveQuotation(formData).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this._successMessage.open('Approval submitted successfully!', 'Close', {
            duration: 3000,
            verticalPosition: "top",
            horizontalPosition: "right",
          });
        }
        this._router.navigateByUrl("admin/sales-orders");
        // this.formClose.emit(true);
        this.approveForm.reset();
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error);
      }
    });
  }

  onToggleChange() {
    const isApproved = this.approveForm.get('approveByAccountant')?.value;
    this.showFileUpload = isApproved;
  }

  closePopup() {
    this.formClose.emit();
  }

  downloadInvoice(): void {
    const link = document.createElement('a');
    link.href = this.invoiceUrl;
    link.target = '_blank';
    link.download = this.invoiceUrl.split('/').pop() || 'invoice.jpg';
    link.click();
  }

  backTosaleListing() {
    this._router.navigateByUrl("/admin/sales-orders");
  }

  // audit logs start
  handleSideDrawerLogs(event?: boolean) {
    if (this.isAuditlogOpen) {
      this.isAuditlogOpen = false;
    } else {
      this.isAuditlogOpen = true;
    }
  }

  openAuditLogs() {
    if (this.isAuditlogOpen) {
      this.isAuditlogOpen = false;
    } else {
      this.isAuditlogOpen = true;
    }
  }
  // audit logs end

  ngOnDestroy(): void {
    if (this.pdfSrc) {
      window.URL.revokeObjectURL(this.pdfSrc);
    }
    this.subscriptions.unsubscribe();
  }
}
