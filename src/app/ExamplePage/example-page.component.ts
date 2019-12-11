import { Component } from "@angular/core";

// Edit 2 - Adicionadas dependencias para chamar o Dialog
import { MatDialog } from "@angular/material/dialog";
import { DialogmaterialangularWrapper } from "../DialogWrapper/dialog-wrapper.component";

@Component({
  selector: "example-page",
  templateUrl: "./example-page.component.html",
  styleUrls: ["./example-page.component.css"]
})
export class ExamplePageComponent {
  openDialog(): void {
    this.dialog.open(DialogmaterialangularWrapper, {});
  }

  public value: string;

  constructor(
    // Edit 2
    public dialog: MatDialog
  ) {}
}
