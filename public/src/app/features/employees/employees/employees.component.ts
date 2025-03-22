import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-employees",
  imports: [RouterModule],
  templateUrl: "./employees.component.html",
  styleUrl: "./employees.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesComponent {}
