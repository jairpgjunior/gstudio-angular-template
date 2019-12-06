import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

let _uniqueOptgroupIdCounter = 0;

@Component({
  selector: 'mh-option-group',
  templateUrl: 'option-group.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // tslint:disable-next-line:use-input-property-decorator
  inputs: ['disabled'],
  styleUrls: ['option-group.scss'],
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    'class': 'mh-option-group',
    'role': 'group',
    // '[class.mh-option-group-disabled]': 'disabled',
    // '[attr.aria-disabled]': 'disabled',
    '[attr.aria-labelledby]': '_labelId',
  }
})
export class MhOptionGroupComponent {

  @Input() label: string;

  _labelId = `mh-option-group-label-${_uniqueOptgroupIdCounter++}`;
}
