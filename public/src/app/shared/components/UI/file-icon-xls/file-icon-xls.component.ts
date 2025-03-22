import {
  Component,
  Input,
  input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";

@Component({
  selector: "app-file-icon-xls",
  imports: [],
  templateUrl: "./file-icon-xls.component.html",
  styleUrl: "./file-icon-xls.component.scss",
})
export class FileIconXlsComponent implements OnChanges {
  @Input() fileName: string = "";
  fileExtantion: string = "";
  ngOnChanges(changes: SimpleChanges): void {
    this.fileExtantion = this.fileName.slice(
      this.fileName.indexOf("."),
      this.fileName.length,
    );
  }
}
