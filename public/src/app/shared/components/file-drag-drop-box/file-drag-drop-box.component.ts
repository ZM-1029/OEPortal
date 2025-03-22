import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { FileValidators, NgxFileDragDropComponent } from "ngx-file-drag-drop";
@Component({
  selector: "app-file-drag-drop-box",
  imports: [CommonModule, NgxFileDragDropComponent, MatIconModule],
  templateUrl: "./file-drag-drop-box.component.html",
  styleUrl: "./file-drag-drop-box.component.scss",
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileDragDropBoxComponent implements OnInit {
  acceptFileType: string = ".xls, .xlsx";
  count: number = 5;
  files: File[] = [];
  @Output() sendFileToSalaryUpload: EventEmitter<File> =
    new EventEmitter<File>();
  public fileControl = new FormControl(
    [],
    [FileValidators.required, FileValidators.maxFileCount(2)],
  );

  constructor(private _changeDetetction: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fileControl.valueChanges.subscribe((files: any) =>
      console.log(this.fileControl.value, this.fileControl.valid),
    );
    // this.getImage()
  }
  onFileDropped(event: any) {
    const fileList: FileList =
      event?.dataTransfer?.files || event?.target?.files;

    if (fileList) {
      this.files = Array.from(fileList);
      console.log("Dropped files:", this.files);
    } else {
      console.log("No files were dropped.");
    }
  }

  onValueChange(file: File[]) {
    console.log(file);
    console.log(file[0]);
    console.log("File changed!");
    this.sendFileToSalaryUpload.emit(file[0]);
  }

  getImage() {
    setInterval(() => {
      this.count--;
      if (this.count < 0) {
        this.count = 5;
      }
      this._changeDetetction.detectChanges();
    }, 1000);
  }
}
