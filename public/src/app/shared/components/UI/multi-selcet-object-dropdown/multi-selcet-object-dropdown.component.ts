import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule, NgOptionTemplateDirective, NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-multi-selcet-object-dropdown',
  imports: [CommonModule, NgSelectModule,
    NgOptionTemplateDirective,
    NgSelectComponent, FormsModule],
  templateUrl: './multi-selcet-object-dropdown.component.html',
  styleUrl: './multi-selcet-object-dropdown.component.scss'
})
export class MultiSelcetObjectDropdownComponent implements OnInit, OnChanges {
  @Input() dataList: any = [];
  @Input() dropdownHeading: string = '';
  @Input() defaultValue: any;
  @Output() selectedOutput: EventEmitter<any> = new EventEmitter<any>();
  transformedDataList: { id: string; name: string }[] = [];
  selectedData: any;
  allSelected: boolean = false;
  iscloseDropdown: boolean = false;
  stringArray: string = '';
  private previousSelectedData: any[] = [];
  @ViewChild('selectRefObj') selectRefObj!: NgSelectComponent;
  constructor() { }

  ngOnInit() {
    // Initialize with default value if provided
    if (this.defaultValue === '0') {
      this.allSelected = true;
    } else if (this.defaultValue) {
      this.selectedData = Array.isArray(this.defaultValue) ?
        [...this.defaultValue] :
        [this.defaultValue];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataList']) {
      this.dataList = changes['dataList'].currentValue;
      this.transformedDataList = this.dataList.map((item: any) => {
        if (typeof item === 'string') {
          this.stringArray = 'string';
          return { id: item, name: item };
        } else {
          this.stringArray = 'object';
          return { id: item.id, name: item.name };
        }
      });

      // Handle default value after data is loaded
      if (this.defaultValue === '0' && this.transformedDataList.length > 0) {
        this.allSelected = true;
        this.toggleSelectAll();
      } else if (this.defaultValue && this.transformedDataList.length > 0) {
        // Ensure default values exist in the data
        const defaultIds = Array.isArray(this.defaultValue) ?
          this.defaultValue :
          [this.defaultValue];

        this.selectedData = this.transformedDataList
          .filter(item => defaultIds.includes(item.id))
          .map(item => item.id);

        this.updateAllSelected();
      }
    }
  }

  toggleSelectAll() {
    if (this.allSelected) {
      if (this.stringArray === 'string') {
        this.selectedData = this.transformedDataList.map(item => item.id);
      }
      if (this.stringArray === 'object') {
        this.selectedData = this.transformedDataList.map(item => item.id);
      }
    } else {
      this.selectedData = [];
    }
    this.updateAllSelected();
  }


  updateAllSelected() {
    if (JSON.stringify(this.previousSelectedData) === JSON.stringify(this.selectedData)) {
      return;
    }

    this.selectRefObj.searchTerm = '';

    this.previousSelectedData = [...this.selectedData];
    this.allSelected = this.selectedData.length === this.transformedDataList.length;

    if (this.allSelected) {
      this.selectedOutput.emit(0);
    } else if (this.selectedData.length !== 0) {
      this.selectedOutput.emit(this.selectedData);
    } else {
      this.selectedOutput.emit(0);
    }
  }

  // Add this method to your component class
  getSelectedItemsDisplay(): string {
    if (!this.selectedData || this.selectedData.length === 0) {
      return `Select ${this.dropdownHeading}`;
    }

    if (this.allSelected || this.selectedData.length === this.transformedDataList.length) {
      return `All ${this.dropdownHeading} selected`;
    }

    if (this.selectedData.length === 1) {
      const selectedItem = this.transformedDataList.find(item => item.id === this.selectedData[0]);
      return selectedItem ? selectedItem.name : '';
    }

    // Get the first selected item's name
    const firstSelected = this.transformedDataList.find(item => item.id === this.selectedData[0]);
    const firstName = firstSelected ? firstSelected.name : '';

    return `${firstName} + ${this.selectedData.length - 1}`;
  }

}




