// import { Component, Inject, Optional } from '@angular/core';
// import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// import { MatButtonModule } from '@angular/material/button';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { MatIconModule } from '@angular/material/icon';
// import { DeleteModalComponent } from 'src/app/shared/components/UI/delete-modal/delete-modal.component';

// @Component({
//   selector: 'app-add-pdf',
//   imports: [MatButtonModule, MatIconModule],
//   templateUrl: './add-pdf.component.html',
//   styleUrl: './add-pdf.component.scss'
// })
// export class AddPdfComponent {
//   constructor(private fb: FormBuilder,
//     public dialogRef: MatDialogRef<DeleteModalComponent>,
//     @Optional() @Inject(MAT_DIALOG_DATA) public data: string,
//   ) {}
//   deleteData: string = "";
//   ngOnInit(): void {
//     this.deleteData = this.data;
//     this.cardForm = this.fb.group({
//       title: ['', Validators.required],
//       subtitle: ['', Validators.required],
//       showButton: [false],
//       image: [null, Validators.required]
//     });
//   }
  
//   confirmDelete(): void {
//     this.dialogRef.close(true);
//   }

//   cancel(): void {
//     this.dialogRef.close(false);
//   }
//   marketingCards = [
//     { id: 1, title: 'Company Overview', subtitle: 'Innovative solutions for evolving needs.', image: 'assets/images/company.jpg', showButton: false },
//     { id: 2, title: 'Consulting & Technology', subtitle: 'Innovative solutions for evolving needs.', image: 'assets/images/consulting.jpg', showButton: false },
//     { id: 3, title: 'Data Protection', subtitle: 'Innovative solutions for evolving needs.', image: 'assets/images/data-protection.jpg', showButton: true },
//   ];

//   cardForm: FormGroup|any;
//   previewImage: string | ArrayBuffer | null = null;
//   showForm = false;

//   onImageChange(event: Event) {
//     const file = (event.target as HTMLInputElement).files?.[0];
//     if (file) {
//       this.cardForm.patchValue({ image: file });
//       const reader = new FileReader();
//       reader.onload = () => this.previewImage = reader.result;
//       reader.readAsDataURL(file);
//     }
//   }

//   onSubmit() {
//     if (this.cardForm.valid) {
//       const newCard = {
//         id: this.marketingCards.length + 1,
//         title: this.cardForm.value.title,
//         subtitle: this.cardForm.value.subtitle,
//         showButton: this.cardForm.value.showButton,
//         image: this.previewImage
//       };
//       // this.marketingCards.push(newCard);
//       this.cardForm.reset();
//       this.previewImage = null;
//       this.showForm = false;
//     }
//   }
// }

import { Component, Inject, Optional } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-add-pdf',
  standalone: true,
  imports: [MatButtonModule, MatIconModule,CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule],
  templateUrl: './add-pdf.component.html',
  styleUrl: './add-pdf.component.scss',
})
export class AddPdfComponent {
  cardForm!: FormGroup;
  previewImage: string | ArrayBuffer | null = null;
  showForm = true;
  logoFile: File | null = null;
  pdfFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<AddPdfComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: string
  ) {}

  ngOnInit(): void {
    this.cardForm = this.fb.group({
      title: ['', Validators.required],
      subtitle: ['', Validators.required],
      showButton: [false],
      image: [null, Validators.required],
      pdf: [null],
    });
  }

  onImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.logoFile = file;
      this.cardForm.patchValue({ image: file });

      const reader = new FileReader();
      reader.onload = () => (this.previewImage = reader.result);
      reader.readAsDataURL(file);
    }
  }

  onPdfChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.pdfFile = file;
      this.cardForm.patchValue({ pdf: file });
    }
  }

  onSubmit() {
    if (this.cardForm.valid && this.logoFile) {
      const formData = new FormData();
      formData.append('Heading', this.cardForm.value.title);
      formData.append('Description', this.cardForm.value.subtitle);
      formData.append('Logo', this.logoFile);
      if (this.pdfFile) {
        formData.append('Pdf', this.pdfFile);
      }

      // const headers = new HttpHeaders({
      //   Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` // Truncated
      // });

      // this.http
      //   .post('http://122.160.133.107:99/api/Marketing/Add', formData, {
      //     headers,
      //   })
      //   .subscribe({
      //     next: (res) => {
      //       alert('Marketing card uploaded!');
      //       this.dialogRef.close(true);
      //     },
      //     error: (err) => {
      //       console.error('Upload failed', err);
      //       alert('Failed to upload marketing card.');
      //     },
      //   });
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
