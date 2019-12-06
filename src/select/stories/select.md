# Select

Api reference for Mahoe Lib Select, import the NgModule for each component you want to use:
`import { MhSelectModule } from '@pan/lib--web-ui-components/ui';`
`import { MhTextFieldModule } from '@pan/lib--web-ui-components/ui';`

## Reference Mahoe
[https://zeroheight.com/35cc2dfe6/p/43dcea](https://zeroheight.com/35cc2dfe6/p/43dcea)

## Component
Seletor: mh-select

### Use
```sh
<mh-text-field assistive="Select">
    <mh-select placeholder="Select">
        <mh-option value="Optons">Optons</mh-option>
    </mh-select>
</mh-text-field>
```

### Properties
 
 #### @Input()
| Properties | Descript |
| ------ | ------ |
| disabled: boolean | Whether the component is disabled. |
| placeholder: string | Floating label when in focus. |
| optionLabel: string | Placeholder to be shown if no value has been selected. |
| required: boolean | Whether the component is required. |
| multiple: boolean | Whether the user should be allowed to select multiple options. |
| search: boolean | Whether the component can search options. |
| searchLabel: string | Placeholder to be shown if search and panel open if no value has been selected. |
| load: boolean | Show icon load. |
| id: string | Unique id of the element. |
| value: any | Value of the select control. |

 #### @Output()
| Properties | Descript |
| ------ | ------ |
| openedChange: EventEmitter<boolean> | Event emitted when the select panel has been toggled. |
| selectionChange: EventEmitter<MhSelectChange> | Event emitted when the selected value has been changed by the user. |
