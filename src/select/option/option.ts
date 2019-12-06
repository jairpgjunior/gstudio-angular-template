// tslint:disable
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ENTER, SPACE, hasModifierKey} from '@angular/cdk/keycodes';
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  InjectionToken,
  Input,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  ViewEncapsulation,
} from '@angular/core';
import {FocusOptions, FocusableOption, FocusOrigin} from '@angular/cdk/a11y';
import {Subject} from 'rxjs';

import { MhOptionGroupComponent } from '../option-group/option-group';

let _uniqueIdCounter = 0;

export class MhOptionSelectionChange {
  constructor(
    public source: MhOptionComponent,
    public isUserInput = false) { }
}

export interface MhOptionParentComponent {
  multiple?: boolean;
}

export const MH_OPTION_PARENT_COMPONENT = new InjectionToken<MhOptionParentComponent>('MH_OPTION_PARENT_COMPONENT');

@Component({
  selector: 'mh-option',
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    'role': 'option',
    '[attr.tabindex]': '_getTabIndex()',
    '[class.mh-option--selected]': 'selected',
    '[class.mh-option--filtered]': 'filtered',
    '[class.mh-option--show-in-filter]': '!filtered',
    '[class.mh-option--multiple]': 'multiple',
    '[class.mh-option--active]': 'active',
    '[id]': 'id',
    '[attr.aria-selected]': '_getAriaSelected()',
    '[attr.aria-disabled]': 'this.disabled',
    '[class.mh-option--disabled]': 'disabled',
    '(click)': '_selectViaInteraction()',
    '(keydown)': '_handleKeydown($event)',
    'class': 'mh-option',
  },
  styleUrls: ['option.scss'],
  templateUrl: 'option.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MhOptionComponent implements FocusableOption, AfterViewChecked, OnDestroy {
  private _selected = false;
  private _active = false;
  private _disabled = false;
  private _mostRecentViewValue = '';
  private _filter = false;


  get multiple() { return this._parent && this._parent.multiple; }
  get selected(): boolean { return this._selected; }
  get filtered(): boolean { return this._filter; }

  @Input() value: any;

  @Input() id: string = `mh-option-${_uniqueIdCounter++}`;

  @Input()
  get disabled() { return this._disabled }
  set disabled(value: any) { this._disabled = coerceBooleanProperty(value); }

  @Output() readonly onSelectionChange = new EventEmitter<MhOptionSelectionChange>();

  readonly _stateChanges = new Subject<void>();

  constructor(
    private _element: ElementRef<HTMLElement>,
    private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MH_OPTION_PARENT_COMPONENT) private _parent: MhOptionParentComponent,
    @Optional() readonly group: MhOptionGroupComponent
  ) {}

  get active(): boolean {
    return this._active;
  }

  get viewValue(): string {
    return (this._getHostElement().textContent || '').trim();
  }

  doFilter(): void {
    if (!this._filter) {
      this._filter = true;
      this._disabled = true;
    }
  }

  notDoFilter(): void {
    if (this._filter) {
      this._filter = false;
      this._disabled = false;
    }
  }

  select(): void {
    if (!this._selected) {
      this._selected = true;
      this._changeDetectorRef.markForCheck();
      this._emitSelectionChangeEvent();
    }
  }

  deselect(): void {
    if (this._selected) {
      this._selected = false;
      this._changeDetectorRef.markForCheck();
      this._emitSelectionChangeEvent();
    }
  }

  focus(_origin?: FocusOrigin, options?: FocusOptions): void {
    const element = this._getHostElement();

    if (typeof element.focus === 'function') {
      element.focus(options);
    }
  }

  setActiveStyles(): void {
    if (!this._active && this._selected) {
        this._active = true;
        this._changeDetectorRef.markForCheck();
    }
  }

  setInactiveStyles(): void {
    if (this._active) {
      this._active = false;
      this._changeDetectorRef.markForCheck();
    }
  }

  getLabel(): string {
    return this.viewValue;
  }

  _handleKeydown(event: KeyboardEvent): void {
    if ((event.keyCode === ENTER || event.keyCode === SPACE) && !hasModifierKey(event)) {
      this._selectViaInteraction();
      event.preventDefault();
    }
  }

  _selectViaInteraction(): void {
    if (!this.disabled) {
      this._selected = this.multiple ? !this._selected : true;
      this._changeDetectorRef.markForCheck();
      this._emitSelectionChangeEvent(true);
    }
  }

  _getAriaSelected(): boolean|null {
    return this.selected || (this.multiple ? false : null);
  }

  _getTabIndex(): string {
    return this.disabled ? '-1' : '0';
  }

  _getHostElement(): HTMLElement {
    return this._element.nativeElement;
  }

  ngAfterViewChecked() {
    if (this._selected) {
      const viewValue = this.viewValue;

      if (viewValue !== this._mostRecentViewValue) {
        this._mostRecentViewValue = viewValue;
        this._stateChanges.next();
      }
    }
  }

  ngOnDestroy() {
    this._stateChanges.complete();
  }

  private _emitSelectionChangeEvent(isUserInput = false): void {
    this.onSelectionChange.emit(new MhOptionSelectionChange(this, isUserInput));
  }
}

export function _countGroupLabelsBeforeOption(optionIndex: number, options: QueryList<MhOptionComponent>,
  optionGroups: QueryList<MhOptionGroupComponent>): number {

  if (optionGroups.length) {
    let optionsArray = options.toArray();
    let groups = optionGroups.toArray();
    let groupCounter = 0;

    for (let i = 0; i < optionIndex + 1; i++) {
      if (optionsArray[i].group && optionsArray[i].group === groups[groupCounter]) {
        groupCounter++;
      }
    }

    return groupCounter;
  }

  return 0;
}

export function _getOptionScrollPosition(optionIndex: number, optionHeight: number,
  currentScrollPosition: number, panelHeight: number): number {
  const optionOffset = optionIndex * optionHeight;

  if (optionOffset < currentScrollPosition) {
    return optionOffset;
  }

  if (optionOffset + optionHeight > currentScrollPosition + panelHeight) {
    return Math.max(0, optionOffset - panelHeight + optionHeight);
  }

  return currentScrollPosition;
}
