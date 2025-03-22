import { Component, ViewEncapsulation } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Subject } from "rxjs";

@Component({
  selector: "app-empty",
  imports: [RouterOutlet],
  templateUrl: "./empty.component.html",
  styleUrl: "./empty.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class EmptyComponent {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  ngOnDestroy(): void {
    this._unsubscribeAll.complete();
  }
}
