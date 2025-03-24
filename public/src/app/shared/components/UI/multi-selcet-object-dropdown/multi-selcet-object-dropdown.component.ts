import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
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
export class MultiSelcetObjectDropdownComponent {
 @Input() dataList: any = [];
  @Input() dropdownHeading: string = '';
  @Input() defaultValue: any;
  @Input() isCustomerId: boolean = false;
  @Output() selectedOutput: EventEmitter<any> = new EventEmitter<any>();
  transformedDataList: { id: string; name: string }[] = [];
  selectedData: any;
  allSelected: boolean = false;
  iscloseDropdown: boolean = false;
  stringArray: string = '';
  private previousSelectedData: any[] = [];
  constructor() { }

  ngOnInit() {
    if (this.defaultValue) {
      this.selectedData = this.defaultValue;
      this.selectedOutput.emit(this.selectedData);
    }
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
    this.previousSelectedData = [...this.selectedData];
    this.allSelected = this.selectedData.length === this.transformedDataList.length;
  
    if (this.allSelected) {
      this.selectedOutput.emit(1);
    } else if (this.selectedData.length !== 0) {
      console.log(this.selectedData,"updateAllSelected");
      
      this.selectedOutput.emit(this.selectedData); // ✅ Emit IDs directly
    } else {
      this.selectedOutput.emit(1);
    }
  }
  

}




