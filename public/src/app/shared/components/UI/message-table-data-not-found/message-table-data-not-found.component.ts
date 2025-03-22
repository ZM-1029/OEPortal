import { ChangeDetectionStrategy, Component, signal } from "@angular/core";

import type { INoRowsOverlayAngularComp } from "ag-grid-angular";
import type { INoRowsOverlayParams } from "ag-grid-community";

type CustomNoRowsOverlayParams = INoRowsOverlayParams & {
  noRowsMessageFunc: () => string;
};

@Component({
  selector: "app-message-table-data-not-found",
  imports: [],
  templateUrl: "./message-table-data-not-found.component.html",
  styleUrl: "./message-table-data-not-found.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageTableDataNotFoundComponent
  implements INoRowsOverlayAngularComp
{
  noRowsMessage = signal("");

  agInit(params: CustomNoRowsOverlayParams): void {
    this.refresh(params);
  }

  refresh(params: CustomNoRowsOverlayParams): void {
    this.noRowsMessage.set(params.noRowsMessageFunc());
  }
}
