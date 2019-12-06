// tslint:disable
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

import { SelectionModel } from '@angular/cdk/collections';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { Directionality } from '@angular/cdk/bidi';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';

import {
  AfterContentInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  DoCheck,
  ElementRef,
  EventEmitter,
  Input,
  isDevMode,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  QueryList,
  Self,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import { Subject, Observable, defer, merge } from 'rxjs';
import { startWith, switchMap, take, filter, map, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { MH_OPTION_PARENT_COMPONENT, MhOptionSelectionChange, _countGroupLabelsBeforeOption, _getOptionScrollPosition, MhOptionComponent } from './option/option';
import { MhOptionGroupComponent } from './option-group/option-group';
import { MhFormFieldControl } from '../text-field/form-field-control';
import { MhTextFieldComponent } from '../text-field/text-field';
import { SelectAnimation } from './select.animation';

let nextUniqueId = 0;

export class MhSelectChange {
  constructor(
    public source: MhSelectComponent,
    public value: any
  ) { }
}

@Component({
  selector: 'mh-select',
  templateUrl: './select.html',
  styleUrls: ['./select.scss'],
  animations: [ SelectAnimation ],
  inputs: ['disabled', 'disableRipple', 'tabIndex'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'role': 'listbox',
    '[attr.id]': 'id',
    '[attr.tabindex]': 'tabIndex',
    '[attr.aria-label]': '_getAriaLabel()',
    '[attr.aria-labelledby]': '_getAriaLabelledby()',
    '[attr.aria-required]': 'this.required',
    '[attr.aria-disabled]': 'this.disabled',
    '[attr.aria-owns]': 'panelOpen ? _optionIds : null',
    '[attr.aria-multiselectable]': 'multiple',
    '[attr.aria-describedby]': '_ariaDescribedby || null',
    '[attr.aria-activedescendant]': '_getAriaActiveDescendant()',
    '[class.mh-select--panelOpen]': 'panelOpen',
    '[class.mh-select__search]': 'search',
    '[class.mh-select--filled]': 'this.triggerValue',
    '[class.mh-select--focused]': 'this.focused',
    '[class.mh-select--disabled]': 'this.disabled',
    '[class.mh-select--required]': 'this.required',
    '[class.mh-select--empty]': 'empty',
    'class': 'mh-select',
    '(keydown)': '_handleKeydown($event)',
    '(focus)': '_onFocus()',
    '(blur)': '_onBlur()',
  },
  providers: [
    { provide: MhFormFieldControl, useExisting: MhSelectComponent },
    { provide: MH_OPTION_PARENT_COMPONENT, useExisting: MhSelectComponent }
  ]
})
export class MhSelectComponent implements AfterContentInit, OnChanges,
  OnDestroy, OnInit, DoCheck, ControlValueAccessor, MhFormFieldControl<any> {

  private _panelOpen = false;

  private _required: boolean = false;
  private _multiple: boolean = false;
  private _search: boolean = false;

  private _placeholder: string;
  private _optionLabel: string;
  private _searchLabel: string = '';

  private _load: boolean = false;
  public seachValue: string;

  private _uid = `mh-select-${nextUniqueId++}`;

  private readonly _destroy = new Subject<void>();

  readonly stateChanges: Subject<void> = new Subject<void>();

  _triggerRect: ClientRect;
  _ariaDescribedby: string;
  _triggerFontSize = 0;
  _selectionModel: SelectionModel<MhOptionComponent>;
  _keyManager: ActiveDescendantKeyManager<MhOptionComponent>;

  _onChange: (value: any) => void = () => {};
  _onTouched = () => {};

  _optionIds: string = '';
  _panelDoneAnimatingStream = new Subject<string>();

  controlType = 'mh-select';

  @ViewChild('trigger') trigger: ElementRef;

  @ViewChild('search') searchInput: ElementRef;

  @ViewChild('panel') panel: ElementRef;

  @ContentChildren(MhOptionComponent, { descendants: true }) options: QueryList<MhOptionComponent>;

  @ContentChildren(MhOptionGroupComponent) optionGroups: QueryList<MhOptionGroupComponent>;

  get focused(): boolean {
    return this._focused || this._panelOpen;
  }

  set focused(value: boolean) {
    this._focused = value;
  }
  private _focused = false;

  @Input()
  get placeholder(): string { return this._placeholder; }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }

  @Input()
  get optionLabel(): string { return this._optionLabel; }
  set optionLabel(value: string) {
    this._optionLabel = value;
    this.stateChanges.next();
  }

  @Input()
  get required(): boolean { return this._required; }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  @Input()
  get multiple(): boolean { return this._multiple; }
  set multiple(value: boolean) {
    this._multiple = coerceBooleanProperty(value);
  }

  @Input()
  get search(): boolean { return this._search; }
  set search(value: boolean) {
    this._search = coerceBooleanProperty(value);
  }

  @Input()
  get searchLabel(): string { return this._searchLabel; }
  set searchLabel(value: string) {
    this._searchLabel = value;
  }

  @Input()
  get load(): boolean { return this._load; }
  set load(value: boolean) {
    this._load = coerceBooleanProperty(value);
  }

  @Input()
  get value(): any { return this._value; }
  set value(newValue: any) {
    if (newValue !== this._value) {
      this.writeValue(newValue);
      this._value = newValue;
    }
  }
  private _value: any;

  get tabIndex(): number { return this.disabled ? -1 : this._tabIndex; }
  set tabIndex(value: number) {
    this._tabIndex = value != null ? value : 0;
  }
  private _tabIndex: number = 0;

  get disabled() { return this._disabled; }
  set disabled(value: any) { this._disabled = coerceBooleanProperty(value); }
  private _disabled: boolean = false;

  @Input('aria-label') ariaLabel: string = '';

  @Input('aria-labelledby') ariaLabelledby: string;

  @Input()
  get id(): string { return this._id; }
  set id(value: string) {
    this._id = value || this._uid;
    this.stateChanges.next();
  }
  private _id: string;

  readonly optionSelectionChanges: Observable<MhOptionSelectionChange> = defer(() => {
    const options = this.options;

    if (options) {
      return options.changes.pipe(
        startWith(options),
        switchMap(() => merge(...options.map(option => option.onSelectionChange)))
      );
    }

    return this._ngZone.onStable
      .asObservable()
      .pipe(take(1), switchMap(() => this.optionSelectionChanges));
  }) as Observable<MhOptionSelectionChange>;

  @Output() readonly openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output('opened') readonly _openedStream: Observable<void> = this.openedChange.pipe(filter(o => o), map(() => {}));

  @Output('closed') readonly _closedStream: Observable<void> = this.openedChange.pipe(filter(o => !o), map(() => {}));

  @Output() readonly selectionChange: EventEmitter<MhSelectChange> = new EventEmitter<MhSelectChange>();

  @Output() readonly valueChange: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    public _elementRef: ElementRef,
    private _viewportRuler: ViewportRuler,
    private _changeDetectorRef: ChangeDetectorRef,
    private _ngZone: NgZone,

    @Optional() private _dir: Directionality,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    @Optional() private _parentFormField: MhTextFieldComponent,
    @Self() @Optional() public ngControl: NgControl,
    @Attribute('tabindex') tabIndex: string
  ) {

    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
    this.tabIndex = parseInt(tabIndex) || 0;

    this.id = this.id;
  }

  ngOnInit() {
    this._selectionModel = new SelectionModel<MhOptionComponent>(this.multiple);
    this.stateChanges.next();

    this._panelDoneAnimatingStream
      .pipe(distinctUntilChanged(), takeUntil(this._destroy))
      .subscribe(() => {
        if (this.panelOpen) {
          this.openedChange.emit(true);
        } else {
          this.openedChange.emit(false);
          this._changeDetectorRef.markForCheck();
        }
      });

    this._viewportRuler.change()
      .pipe(takeUntil(this._destroy))
      .subscribe(() => {
        if (this._panelOpen) {
          this._triggerRect = this.trigger.nativeElement.getBoundingClientRect();
          this._changeDetectorRef.markForCheck();
        }
      });
  }

  ngAfterContentInit() {
    this._initKeyManager();

    this._selectionModel.onChange.pipe(takeUntil(this._destroy)).subscribe(event => {
      event.added.forEach(option => option.select());
      event.removed.forEach(option => option.deselect());
    });

    this.options.changes.pipe(startWith(null), takeUntil(this._destroy)).subscribe(() => {
      this._resetOptions();
      this._initializeSelection();
    });
  }

  ngDoCheck() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['disabled']) {
      this.stateChanges.next();
    }
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
    this.stateChanges.complete();
  }

  writeValue(value: any): void {
    if (this.options) {
      this._setSelectionByValue(value);
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this._changeDetectorRef.markForCheck();
    this.stateChanges.next();
  }

  get panelOpen(): boolean {
    return this._panelOpen;
  }

  get selected(): MhOptionComponent | MhOptionComponent[] {
    return this.multiple ? this._selectionModel.selected : this._selectionModel.selected[0];
  }

  get triggerValue(): string {
    if (this.empty) {
      return '';
    }

    if (this._multiple) {
      const selectedOptions = this._selectionModel.selected.map(option => option.viewValue);

      if (this._isRtl()) {
        selectedOptions.reverse();
      }

      return selectedOptions.join(', ');
    }

    return this._selectionModel.selected[0].viewValue;
  }

  _isRtl(): boolean {
    return this._dir ? this._dir.value === 'rtl' : false;
  }

  _onFocus() {
    if (!this.disabled) {
      this._focused = true;
      this.stateChanges.next();
    }
  }

  _onBlur() {
    this._focused = false;

    if (!this.disabled && !this.panelOpen) {
      this._onTouched();
      this._changeDetectorRef.markForCheck();
      this.stateChanges.next();
    }
  }

  get empty(): boolean {
    return !this._selectionModel || this._selectionModel.isEmpty();
  }

  private _initializeSelection(): void {
    Promise.resolve().then(() => {
      this._setSelectionByValue(this.ngControl ? this.ngControl.value : this._value);
      this.stateChanges.next();
    });
  }

  private _setSelectionByValue(value: any | any[]): void {
    if (this.multiple && value) {
      this._selectionModel.clear();
      value.forEach((currentValue: any) => this._selectValue(currentValue));
    } else {
      this._selectionModel.clear();
      const correspondingOption = this._selectValue(value);

      if (correspondingOption) {
        this._keyManager.setActiveItem(correspondingOption);
      }
    }

    this._changeDetectorRef.markForCheck();
  }

  private _selectValue(value: any): MhOptionComponent | undefined {
    const correspondingOption = this.options.find((option: MhOptionComponent) => {
      try {
        if(typeof value === 'object') {
          return option.value != null &&  JSON.stringify(option.value) === JSON.stringify(value);
        } else {
          return option.value != null &&  option.value === value;
        }
      } catch (error) {
        if (isDevMode()) {
          console.warn(error);
        }
        return false;
      }
    });

    if (correspondingOption) {
      this._selectionModel.select(correspondingOption);
    }

    return correspondingOption;
  }

  private _resetOptions(): void {
    const changedOrDestroyed = merge(this.options.changes, this._destroy);

    this.optionSelectionChanges.pipe(takeUntil(changedOrDestroyed)).subscribe(event => {
      this._onSelect(event.source, event.isUserInput);

      if (event.isUserInput && !this.multiple && this._panelOpen) {
        this.close();
        this.focus();
      }
    });

    merge(...this.options.map(option => option._stateChanges))
      .pipe(takeUntil(changedOrDestroyed))
      .subscribe(() => {
        this._changeDetectorRef.markForCheck();
        this.stateChanges.next();
      });

    this._setOptionIds();
  }

  // option is clicked.

  private _onSelect(option: MhOptionComponent, isUserInput: boolean): void {
    const wasSelected = this._selectionModel.isSelected(option);

    if (option.value == null && !this._multiple) {
      option.deselect();
      this._selectionModel.clear();
      this._propagateChanges(option.value);
    } else {
      option.selected ? this._selectionModel.select(option) : this._selectionModel.deselect(option);

      if (isUserInput) {
        this._keyManager.setActiveItem(option);
      }

      if (this.multiple) {
        if (isUserInput) {
          this.focus();
        }
      }
    }

    if (wasSelected !== this._selectionModel.isSelected(option)) {
      this._propagateChanges();
    }

    this.stateChanges.next();
  }

  private _propagateChanges(fallbackValue?: any): void {
    let valueToEmit: any = null;

    if (this.multiple) {
      valueToEmit = (this.selected as MhOptionComponent[]).map(option => option.value);
    } else {
      valueToEmit = this.selected ? (this.selected as MhOptionComponent).value : fallbackValue;
    }

    this._value = valueToEmit;
    this.valueChange.emit(valueToEmit);
    this._onChange(valueToEmit);
    this.selectionChange.emit(new MhSelectChange(this, valueToEmit));
    this._changeDetectorRef.markForCheck();
  }

  private _setOptionIds() {
    this._optionIds = this.options.map(option => option.id).join(' ');
  }

  focus(options?: FocusOptions): void {
    this._elementRef.nativeElement.focus(options);
  }

  onContainerClick() {
    this.focus();
    this.open();
  }

  get shouldLabelFloat(): boolean {
    return this._panelOpen || !this.empty;

  }

  // Change Panel

  toggle(): void {
    this.panelOpen ? this.close() : this.open();
  }

  open(): void {
    if (this.disabled || !this.options || !this.options.length || this._panelOpen) {
      return;
    }

    this._panelOpen = true;
    this._keyManager.withHorizontalOrientation(null);

    this._highlightCorrectOption();
    this._changeDetectorRef.markForCheck();

    // if (this.search) {
    //   this.searchInput.nativeElement.focus();
    // }
  }

  close(): void {
    this.clearSeach();

    if (this._panelOpen) {
      this._panelOpen = false;
      this._keyManager.withHorizontalOrientation(this._isRtl() ? 'rtl' : 'ltr');
      this._changeDetectorRef.markForCheck();
      this._onTouched();
    }

    if (this.search && this.panelOpen) {
      this.searchInput.nativeElement.blur();
      this.searchInput.nativeElement.value = '';
      this.options.map(option => option.notDoFilter());
    }
  }

  // Filter

  public searchOptions($event: any): void {
    this.seachValue = $event.target.value;

    this.resetFilter(this.options.filter(option =>
      !this.removeAccents(option.viewValue).toLowerCase().includes(this.removeAccents($event.target.value.toLowerCase()))
    ));
    this.showInFilter(this.options.filter(option =>
      this.removeAccents(option.viewValue).toLowerCase().includes(this.removeAccents($event.target.value.toLowerCase()))
    ), $event.target.value);
  }

  showInFilter(optionsFiltered, value) {
    optionsFiltered.forEach(option => {
      let text = this.removeAccents(option.viewValue).toLowerCase().indexOf(this.removeAccents(value.toLowerCase()));
      let regex = new RegExp('(.{' + text + '})(.{' + value.length + '})');

      option._getHostElement().children[0].innerHTML = option.viewValue;
      option._getHostElement().children[0].innerHTML = option._getHostElement().children[0].innerHTML.replace(regex,'$1<span>$2</span>');
      option.notDoFilter()
      option.setInactiveStyles();
    });

    if (optionsFiltered[0]) {
      optionsFiltered[0].setActiveStyles();
    }
  }

  resetFilter(optionsNotFiltered) {
    optionsNotFiltered.forEach(option => {
      option._getHostElement().children[0].innerHTML = option.viewValue;
      option.doFilter()
    });
  }

  private removeAccents(value: string): string {
    const accentMap = {
      a: /[\xE0-\xE6]/g,
      e: /[\xE8-\xEB]/g,
      i: /[\xEC-\xEF]/g,
      o: /[\xF2-\xF6]/g,
      u: /[\xF9-\xFC]/g,
      c: /\xE7/g,
      n: /\xF1/g
    };

    Object.keys(accentMap).forEach((key) => {
      value = value.toLowerCase().replace(accentMap[key], key);
    });

    return value;
  }

  clearClose() {
    if(this.seachValue) {
      this.clearSeach();
    } else {
      this.close();
    }
  }

  clearSeach() {
    if (this.searchInput) {
      this.seachValue = "";
      this.searchInput.nativeElement.value = '';
      this.showInFilter(this.options.filter(option =>
        this.removeAccents(option.viewValue).toLowerCase().includes(this.removeAccents(''))
      ), '');
    }
  }

  // Keyboard functions

  private _initKeyManager() {
    this._keyManager = new ActiveDescendantKeyManager<MhOptionComponent>(this.options)
      .withVerticalOrientation()
      .withHorizontalOrientation(this._isRtl() ? 'rtl' : 'ltr')
      .withAllowedModifierKeys(['shiftKey']);

    this._keyManager.tabOut.pipe(takeUntil(this._destroy)).subscribe(() => {
      this.focus();
      this.close();
    });

    this._keyManager.change.pipe(takeUntil(this._destroy)).subscribe(() => {
      if (this._panelOpen) {
        this._scrollActiveOptionIntoView();
      } else if (!this._panelOpen && !this.multiple && this._keyManager.activeItem) {
        this._keyManager.activeItem._selectViaInteraction();
      }
    });
  }

  private _scrollActiveOptionIntoView(): void {
    const activeOptionIndex = this._keyManager.activeItemIndex || 0;
    const labelCount = _countGroupLabelsBeforeOption(activeOptionIndex, this.options, this.optionGroups);

    if (this.panel) {
      this.panel.nativeElement.scrollTop = _getOptionScrollPosition(
        this._keyManager.activeItemIndex + labelCount,
        this._keyManager.activeItem._getHostElement().offsetHeight,
        this.panel.nativeElement.scrollTop,
        this.panel.nativeElement.offsetHeight
      );
    }
  }

  private _highlightCorrectOption(): void {
    if (this._keyManager) {
      if (this.empty) {
        this._keyManager.setFirstItemActive();
      } else {
        this._keyManager.setActiveItem(this._selectionModel.selected[0]);
      }
    }
  }

  _handleKeydown(event: KeyboardEvent): void {
    if (!this.disabled) {
      this.panelOpen ? this._handleOpenKeydown(event) : this._handleClosedKeydown(event);
    }
  }

  private _handleClosedKeydown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;
    const isArrowKey = keyCode === 40 || keyCode === 38 || keyCode === 37 || keyCode === 39;
    const isOpenKey = keyCode === 13 || keyCode === 32;
    const manager = this._keyManager;

    if ((isOpenKey && !hasModifierKey(event)) || ((this.multiple || event.altKey) && isArrowKey)) {
      event.preventDefault();
      this.open();
    } else if (!this.multiple) {
      const previouslySelectedOption = this.selected;

      if (keyCode === 36 || keyCode === 35) {
        keyCode === 36 ? manager.setFirstItemActive() : manager.setLastItemActive();
        event.preventDefault();
      } else {
        manager.onKeydown(event);
      }

      const selectedOption = this.selected;
    }
  }

  private _handleOpenKeydown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;
    const isArrowKey = keyCode === 40 || keyCode === 38;
    const isCloseKey = keyCode === 27;
    const manager = this._keyManager;

    if (keyCode === 36 || keyCode === 35) {
      event.preventDefault();
      keyCode === 36 ? manager.setFirstItemActive() : manager.setLastItemActive();
    } else if (isCloseKey) {
      event.preventDefault();
      this.close();
    } else if (isArrowKey && event.altKey) {
      event.preventDefault();
      this.close();
    } else if ((keyCode === 13) && manager.activeItem &&
      !hasModifierKey(event)) {
      event.preventDefault();
      manager.activeItem._selectViaInteraction();
    } else if (this._multiple && keyCode === 65 && event.ctrlKey) {
      event.preventDefault();
      const hasDeselectedOptions = this.options.some(opt => !opt.disabled && !opt.selected);

      this.options.forEach(option => {
        if (!option.disabled) {
          hasDeselectedOptions ? option.select() : option.deselect();
        }
      });
    } else {
      const previouslyFocusedIndex = manager.activeItemIndex;

      manager.onKeydown(event);

      if (this._multiple && isArrowKey && event.shiftKey && manager.activeItem &&
          manager.activeItemIndex !== previouslyFocusedIndex) {
        manager.activeItem._selectViaInteraction();
      }
    }
  }


  // Arials Functions

  setDescribedByIds(ids: string[]) {
    this._ariaDescribedby = ids.join(' ');
  }

  _getAriaLabel(): string | null {
    return this.ariaLabelledby ? null : this.ariaLabel || this.placeholder;
  }

  _getAriaLabelledby(): string | null {
    if (this.ariaLabelledby) {
      return this.ariaLabelledby;
    }

    return this._parentFormField._labelId || null;
  }

  _getAriaActiveDescendant(): string | null {
    if (this.panelOpen && this._keyManager && this._keyManager.activeItem) {
      return this._keyManager.activeItem.id;
    }

    return null;
  }
}
