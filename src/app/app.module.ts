import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { CustomMaterialModule } from "./material.module";
import { AppComponent } from "./app.component";
import { ExamplePageComponent } from "./ExamplePage/example-page.component";
import { GstudioModule } from "./gstudio/gstudio.module";
import { DialogmaterialangularWrapper } from "./ExamplePage/DialogWrapper/dialog-wrapper.component";

@NgModule({
  declarations: [
    AppComponent,
    DialogmaterialangularWrapper,
    ExamplePageComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CustomMaterialModule,
    GstudioModule
  ],
  providers: [],
  bootstrap: [AppComponent, DialogmaterialangularWrapper]
})
export class AppModule {}
