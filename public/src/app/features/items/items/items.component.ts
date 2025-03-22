import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-items',
  imports: [RouterModule],
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsComponent {

}
