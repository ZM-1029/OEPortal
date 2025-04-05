import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SalesService } from '../sales.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SafePipe } from "../safe.pipe";

@Component({
  selector: 'app-approve-quatation',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule, SafePipe],
  templateUrl: './approve-quatation.component.html',
  styleUrl: './approve-quatation.component.scss'
})
export class ApproveQuatationComponent {
  approveForm!: FormGroup;
  selectedFile: File | null = null;
  errorMessage: string = '';
  showFileUpload: boolean = false;
  quotationStatus: any[] = [];
  pdfUrl: string | null = null;
  @Input() isApprovePopupOpen: boolean = false;
  @Input() Id: number = 0;
  @Output() formClose = new EventEmitter<boolean>();
  constructor(private fb: FormBuilder, private _salesService: SalesService, private _successMessage: MatSnackBar, private cdr: ChangeDetectorRef) {
    this.createForm();
  }
  ngOnInit(): void {
    this.loadPDF();
    this.getQuotationDetails(this.Id);
    this.getQuotationStatus(this.Id);
  }
  private handleError(err: any) {
    this._successMessage.open(err.error.message, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }
  getQuotationDetails(quotationId: number) {
    this._salesService.getQuotationStatusDetails(quotationId).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          const isSelfApproved = response.data.isSelfApproved || false;
          const isApprovedByAccountant = response.data.isApprovedByAccountant || false;
          const invoice = response.data.invoice || null;
          this.approveForm.patchValue({
            selfApprove: isSelfApproved,
            approveByAccountant: isApprovedByAccountant,
          });
          if (invoice) {
            this.selectedFile = invoice;
            console.log(this.selectedFile, 'this.selectedFile');

          }
          const approveByAccountantControl = this.approveForm.get('approveByAccountant');
          if (isSelfApproved) {
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
          console.log(this.quotationStatus, 'this.quotationStatus ')
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
      file: [null]
    });
  }
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (allowedTypes.includes(file.type)) {
        this.selectedFile = file;
        this.approveForm.patchValue({ file: file });
        this.errorMessage = '';
      } else {
        this.selectedFile = null;
        this.errorMessage = 'Only PDF and image files (JPEG, PNG) are allowed.';
        event.target.value = '';
      }
    }
  }


  reset() {
    this.approveForm.reset();
    this.selectedFile = null;
  }

  submitForm() {
    if (this.approveForm.valid) {
      const formData = new FormData();
      formData.append('QuotationId', this.Id.toString());
      // formData.append('IsSelfApproved', this.approveForm.value.selfApprove ? 'true' : 'false');
      // formData.append('IsApprovedByAccountant', this.approveForm.value.approveByAccountant ? 'true' : 'false');
      formData.append('IsSelfApproved', this.approveForm.value.selfApprove);
      formData.append('IsApprovedByAccountant', this.approveForm.value.approveByAccountant);

      // formData.append('Invoice', this.selectedFile ? this.selectedFile : '');
      if (this.selectedFile) {
        formData.append('Invoice', this.selectedFile);
      }
      this._salesService.approveQuotation(formData).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this._successMessage.open('Approval submitted successfully!', 'Close', {
              duration: 3000,
            });
          }
          this.formClose.emit(true);
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error);
        }
      });
    } else {
      this.approveForm.markAllAsTouched();
    }
  }

  onToggleChange() {
    const isApproved = this.approveForm.get('approveByAccountant')?.value;
    this.showFileUpload = isApproved;
  }
  closePopup() {
    this.formClose.emit();
  }
  downloadPDF(): void {
    this._salesService.downloadPDF(this.Id).subscribe({
      next: (response: any) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Quotation_${this.Id}.pdf`;
        link.click();
        this.pdfUrl = url;
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  loadPDF(): void {
    if (this.pdfUrl) {
      return;
    }
    this._salesService.downloadPDF(this.Id).subscribe({
      next: (response: any) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        this.pdfUrl = URL.createObjectURL(blob);
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }
}
