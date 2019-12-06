import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanFormModule } from '@pan/lib--web-ui-components/core';
import { MhSelectComponent } from './select';
import { MhOptionComponent } from './option/option';
import { MhOptionGroupComponent } from './option-group/option-group';

@NgModule({
  imports: [
    CommonModule,
    PanFormModule
  ],
  exports: [
    MhSelectComponent,
    MhOptionComponent,
    MhOptionGroupComponent
  ],
  declarations: [
    MhSelectComponent,
    MhOptionComponent,
    MhOptionGroupComponent
  ],
  entryComponents: [
    // MhSelectComponent,
    // MhOptionComponent,
    // MhOptionGroupComponent
  ]
})
export class MhSelectModule {
  // constructor(private injector: Injector ) {
  //   // const MhTextFieldElement = createCustomElement(MhTextFieldComponent, { injector });
  //   // customElements.define('mh-text-field', MhTextFieldElement);

  //   // const MhInputElement = createCustomElement(nput, { injector });
  //   // customElements.define('mhInput', MhInputElement, { extends: 'input' });
  // }
}
