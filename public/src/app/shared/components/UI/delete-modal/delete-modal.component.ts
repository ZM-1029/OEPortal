import { Component, Inject, OnInit, Optional } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-delete-modal",
  imports: [MatButtonModule, MatIconModule],
  templateUrl: "./delete-modal.component.html",
  styleUrl: "./delete-modal.component.scss",
})
export class DeleteModalComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DeleteModalComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: string,
  ) {}
  deleteData: string = "";
  ngOnInit(): void {
    this.deleteData = this.data;
  }
  
  confirmDelete(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
