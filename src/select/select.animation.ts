import {
  trigger,
  animate,
  transition,
  style,
  state,
  AnimationTriggerMetadata
} from '@angular/animations';

export const SelectAnimation: AnimationTriggerMetadata =
  trigger('detailExpand', [
    state('collapsed', style({display: 'none', height: '0px'})),
    state('expanded', style({height: '*'})),
    transition('expanded <=> collapsed', animate('2ms')),
  ]);
