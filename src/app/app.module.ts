import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { CustomMaterialModule } from "./material.module";
import { AppComponent } from "./app.component";
import { gstudioModule } from "./gstudio/gstudio.module";
import { ExamplePageComponent } from "./ExamplePage/example-page.component";
import { DialogmaterialangularWrapper } from "./ExamplePage/DialogWrapper/dialog-wrapper.component";

@NgModule({
  declarations: [
    AppComponent,
    ExamplePageComponent,
    DialogmaterialangularWrapper
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CustomMaterialModule,
    gstudioModule
  ],
  providers: [],
  bootstrap: [AppComponent, DialogmaterialangularWrapper]
})
export class AppModule {}
