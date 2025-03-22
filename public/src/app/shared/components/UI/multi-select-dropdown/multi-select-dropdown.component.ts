import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgOptionTemplateDirective, NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
@Component({
  selector: 'app-multi-select-dropdown',
  imports: [CommonModule, NgSelectModule,
    NgOptionTemplateDirective,
    NgSelectComponent, FormsModule],
  templateUrl: './multi-select-dropdown.component.html',
  styleUrl: './multi-select-dropdown.component.scss',
})
export class MultiSelectDropdownComponent implements OnInit, OnChanges {
  @Input() dataList: any = [];
  @Input() dropdownHeading: string = '';
  @Output() selectedOutput: EventEmitter<any> = new EventEmitter<any>();
  transformedDataList: { id: string; name: string }[] = [];
  selectedData: any[] = [];
  allSelected: boolean = false;
  iscloseDropdown: boolean = false;
  stringArray: string = '';
  private previousSelectedData: any[] = [];
  constructor() { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataList']) {
      this.dataList = changes['dataList'].currentValue;
      this.transformedDataList = this.dataList.map((item: any, index: number) => {
        if (typeof (item) == 'string') {
          this.stringArray = 'string';
          return { id: item, name: item }
        } else {
          this.stringArray = 'object';
          return { id: item.id, name: item.name }
        }
      }
      );

    }
  }

  toggleSelectAll() {
    if (this.allSelected) {
      if (this.stringArray = 'string') {
        this.selectedData = this.transformedDataList.map(item => item.id);
      }
      if (this.stringArray = 'object') {
        this.selectedData = this.transformedDataList.map(item => item.name);
      }
    } else {
      this.selectedData = [];
    }
  }


  updateAllSelected() {
    if (JSON.stringify(this.previousSelectedData) === JSON.stringify(this.selectedData)) {
      return;
    }
    this.previousSelectedData = [...this.selectedData];
    this.allSelected = this.selectedData.length === this.transformedDataList.length;

    if (this.allSelected) {
      this.selectedOutput.emit(1);
    }

    if (this.stringArray == 'string' && !this.allSelected) {
      this.selectedOutput.emit(1);
    }

    if (this.selectedData.length !== 0 && this.stringArray == 'string' && !this.allSelected) {
      this.selectedOutput.emit(this.selectedData);
    }

    const extractedData: string[] = [];
    if (this.stringArray == 'object' && !this.allSelected) {
      this.selectedOutput.emit(1);
    }

    if (this.selectedData.length !== 0 && this.stringArray == 'object' && !this.allSelected) {
      for (const data of this.selectedData) {
        const match = data.match(/\((.*?)\)/);
        if (match) {
          extractedData.push(match[1]);
        }
      }
      this.selectedOutput.emit(extractedData);
    }
  }


}


