import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule, NgOptionTemplateDirective, NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-month-multi-select-dropdown',
  imports: [CommonModule, NgSelectModule,
        NgOptionTemplateDirective,
        NgSelectComponent, FormsModule],
  templateUrl: './month-multi-select-dropdown.component.html',
  styleUrl: './month-multi-select-dropdown.component.scss'
})
export class MonthMultiSelectDropdownComponent implements OnInit ,OnChanges {
  @Input() dataList: { id: string; name: string }[] = [];
  @Input() dropdownHeading: string = '';
  @Input() defaultValue: any;
  @Output() selectedOutput: EventEmitter<any> = new EventEmitter<any>();
@ViewChild('selectRefMonth') selectRefMonth!: NgSelectComponent;
  transformedDataList: { id: string; name: string }[] = [];
  selectedData: string[] = [];
  allSelected: boolean = false;
  iscloseDropdown: boolean = false; 

  constructor() {}

  ngOnInit() {
    if (this.defaultValue) {
      this.selectedData = Array.isArray(this.defaultValue)
        ? [...this.defaultValue]
        : [this.defaultValue.toString()]; 
      this.selectedOutput.emit(this.selectedData);
    }
  }
  

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataList'] && this.dataList) {
      this.transformedDataList = this.dataList.map(item => ({
        id: item.id,
        name: item.name
      }));
    }
  }

  toggleSelectAll() {
    if (this.allSelected) {
      this.selectedData = this.transformedDataList.map(item => item.id); 
    } else {
      this.selectedData = []; // Deselect all
    }
    this.updateAllSelected();
  }

  updateAllSelected() {
    this.allSelected = this.selectedData.length === this.transformedDataList.length;
    this.selectRefMonth.searchTerm = '';// ✅ bypass TS check
    if (this.selectedData.length !== 0) {
      this.selectedOutput.emit(this.selectedData); 
    } else {
      this.selectedOutput.emit('0'); 
    }
  }
}
