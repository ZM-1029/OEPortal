import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule, NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-single-select-dropdown',
  imports: [CommonModule, NgSelectModule, NgSelectComponent, FormsModule],
  templateUrl: './single-select-dropdown.component.html',
  styleUrl: './single-select-dropdown.component.scss'
})
export class SingleSelectDropdownComponent {
  @Input() dataList: any = [];
  @Input() dropdownHeading: string = '';
  @Input() defaultValue: any;  // Accept default value as input
  @Output() selectedOutput: EventEmitter<any> = new EventEmitter<any>();
  transformedDataList: { label: string; value: string }[] = [];
  selectedData: any;

  constructor() {}

  ngOnInit() {
    // Set the default value if provided
    if (this.defaultValue) {
      this.selectedData = this.defaultValue;
      this.selectedOutput.emit(this.selectedData);
      console.log(this.dataList,"dataList");
    }
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataList']) {
      this.dataList = changes['dataList'].currentValue;
      this.transformedDataList = this.dataList.map((item: any) => ({
        value: item.value,  
        label: item.label
      }));
  
      if (this.defaultValue && this.transformedDataList.some(item => item.value === this.defaultValue)) {
        this.selectedData = this.defaultValue;
       
      }
    }
  }
  
  updateSelected() {
    this.selectedOutput.emit(this.selectedData); 
  }
  }
  

//   updateSelected() {
//     console.log(this.selectedData,"updateSelected");
    
//     this.selectedOutput.emit(this.selectedData);
//   }
// }
