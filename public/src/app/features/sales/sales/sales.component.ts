import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-sales',
  imports: [RouterModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesComponent {

}
