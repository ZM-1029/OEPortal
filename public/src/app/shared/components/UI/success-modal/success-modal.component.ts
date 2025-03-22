import {
  Component,
  Inject,
  OnChanges,
  OnInit,
  Optional,
  SimpleChanges,
} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import {
  MatSnackBarRef,
  MAT_SNACK_BAR_DATA,
  MatSnackBarModule,
} from "@angular/material/snack-bar";
@Component({
  selector: "app-success-modal",
  imports: [MatSnackBarModule, MatIconModule],
  templateUrl: "./success-modal.component.html",
  styleUrl: "./success-modal.component.scss",
})
export class SuccessModalComponent implements OnInit, OnChanges {
  constructor(
    public snackBarRef: MatSnackBarRef<SuccessModalComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
  ) {}

  message: string = "";

  ngOnInit(): void {
    this.message = this.data.message;
    //  close()
  }
  close() {
    this.snackBarRef.dismiss();
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.close();
  }
}
