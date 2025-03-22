import { Component, Input, OnChanges, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import { CustomersService } from "../../../../features/customers/customers.service";

@Component({
  selector: "app-page-header",
  imports: [],
  templateUrl: "./page-header.component.html",
  styleUrl: "./page-header.component.scss",
})
export class PageHeaderComponent implements OnInit {
  @Input() HeadingName!: string;

  constructor(private _customerService: CustomersService) {}

  heading: string = "";
  ngOnInit(): void {
    this.heading = this.HeadingName;
  }
}
