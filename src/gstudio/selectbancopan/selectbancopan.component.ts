// Generated by https://gstudio.io/pages/undefined

import { Component, Input, Output, EventEmitter  } from '@angular/core';
import MhSelectModule from 'src/select/select.module.ts';

@Component({
    selector: 'selectbancopan',
    templateUrl: './selectbancopan.component.html',
    styleUrls: ['./selectbancopan.component.css']
})
export class Selectbancopan {
    @Input() value: Array<string>;
    @Input() placeholder: string;
}