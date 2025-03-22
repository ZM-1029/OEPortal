import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { AppComponent } from "./app/app.component";
import "@angular/compiler";
import { enableProdMode } from "@angular/core";

if ((window as any).ENABLE_PROD_MODE) {
  enableProdMode();
}
bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
