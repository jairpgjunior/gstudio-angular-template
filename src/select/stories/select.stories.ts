import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { storiesOf, moduleMetadata } from '@storybook/angular';
import { action, actions } from '@storybook/addon-actions';
import { withKnobs, boolean, text } from '@storybook/addon-knobs/angular';

import { MhSelectComponent } from '../select';
import { MhOptionComponent } from '../option/option';
import { MhOptionGroupComponent } from '../option-group/option-group';

import { MhTextFieldComponent } from '../../text-field/text-field';
import { MhInputDirective } from '../../text-field/input/input';

import markdownNotes from './select.md';

storiesOf('Select', module)
.addDecorator(
  moduleMetadata({
    imports: [ BrowserAnimationsModule ],
    declarations: [
      MhSelectComponent,
      MhOptionComponent,
      MhOptionGroupComponent,
      MhTextFieldComponent,
      MhInputDirective
    ]
  }),
)
.addDecorator(withKnobs)
.add('Basic', () => {
    return {
      template: `
        <mh-text-field assistive="Select Basic">
          <mh-select
            className="btn"
            placeholder="Basic"
            [optionLabel]="optionLabel"
            [searchLabel]="searchLabel"
            [load]="load"
            [disabled]="disabled"
            [search]="search"
            (selectionChange)="selected($event)"
          >
            <mh-option value="Exemplo">Exemplo</mh-option>
            <mh-option [value]="{ex: 'Exemplo'}">Exemplo 2</mh-option>
            <mh-option value="Exemplo-3" disabled>Disabled</mh-option>
            <mh-option value="Exemplo-4">Exemplo 4</mh-option>
            <mh-option value="Exemplo-5">Exemplo 5</mh-option>
            <mh-option value="Exemplo-6">Exemplo 6</mh-option>
            <mh-option value="Exemplo-7">Exemplo 7</mh-option>
            <mh-option value="Exemplo-8">Exemplo 8</mh-option>
          </mh-select>
        </mh-text-field>

        <mh-text-field assistive="Select Vazio">
          <mh-select placeholder="Vazio"
            [optionLabel]="optionLabel"
            [searchLabel]="searchLabel"
            [load]="load"
            [disabled]="disabled"
            [search]="search"
          >
          </mh-select>
        </mh-text-field>


        <mh-text-field assistive="Select com Grupo">
          <mh-select
            placeholder="Group"
            [optionLabel]="optionLabel"
            [searchLabel]="searchLabel"
            [load]="load"
            [disabled]="disabled"
            [search]="search"
            (selectionChange)="selected($event)"
          >
            <mh-option value="Exemplo">Exemplo</mh-option>
            <mh-option value="Exemplo-2">Exemplo 2</mh-option>
            <mh-option value="Exemplo-3" disabled>Disabled</mh-option>
            <mh-option value="Exemplo-4">Exemplo 4</mh-option>
            <mh-option-group>Grupo
              <mh-option value="Exemplo-5">Exemplo 5</mh-option>
              <mh-option value="Exemplo-6">Exemplo 6</mh-option>
              <mh-option value="Exemplo-7">Exemplo 7</mh-option>
              <mh-option value="Exemplo-8">Exemplo 8</mh-option>
            </mh-option-group>
          </mh-select>
        </mh-text-field>
      `,
      props: {
        load: boolean('Loader', false),
        disabled: boolean('Disabled', false),
        search: boolean('Search', false),
        optionLabel: text('Text Select', 'Selecione uma opção...'),
        searchLabel:  text('Search Label', 'Busque uma opção...'),
        selected: action('Item Selecionado')
      },
    };
  }, {
    notes: { markdown: markdownNotes },
  })
  .add('Multiplo', () => {
    return {
      template: `
        <mh-text-field assistive="Select multiplo">
          <mh-select placeholder="Multiplo" multiple
            [optionLabel]="optionLabel"
            [searchLabel]="searchLabel"
            [load]="load"
            [disabled]="disabled"
            [search]="search"
            (selectionChange)="selected($event)"
          >
            <mh-option value="Exemplo">Exemplo</mh-option>
            <mh-option value="Exemplo-2">Exemplo 2</mh-option>
            <mh-option value="Exemplo-3" disabled>Disabled</mh-option>
            <mh-option value="Exemplo-4">Exemplo 4</mh-option>
            <mh-option value="Exemplo-5">Exemplo 5</mh-option>
            <mh-option value="Exemplo-6">Exemplo 6</mh-option>
            <mh-option value="Exemplo-7">Exemplo 7</mh-option>
            <mh-option value="Exemplo-8">Exemplo 8</mh-option>
            <mh-option value="Exemplo-8">Exemplo 9</mh-option>
            <mh-option value="Exemplo-8">Exemplo 10</mh-option>
            <mh-option value="Exemplo-8">Exemplo 11</mh-option>
            <mh-option value="Exemplo-8">Exemplo 12</mh-option>
            <mh-option value="Exemplo-8">Exemplo 13</mh-option>
            <mh-option value="Exemplo-8">Exemplo 14</mh-option>
            <mh-option value="Exemplo-8">Exemplo 15</mh-option>
          </mh-select>
        </mh-text-field>
        <mh-text-field assistive="Select multiplo com grupo">
          <mh-select placeholder="Multiplo com grupo" multiple
            [optionLabel]="optionLabel"
            [searchLabel]="searchLabel"
            [load]="load"
            [disabled]="disabled"
            [search]="search"
            (selectionChange)="selected($event)"
          >
            <mh-option value="Exemplo">Exemplo</mh-option>
            <mh-option value="Exemplo-2">Exemplo 2</mh-option>
            <mh-option value="Exemplo-3" disabled>Disabled</mh-option>
            <mh-option value="Exemplo-4">Exemplo 4</mh-option>
            <mh-option-group>Grupo
              <mh-option value="Exemplo-5">Exemplo 5</mh-option>
              <mh-option value="Exemplo-6">Exemplo 6</mh-option>
              <mh-option value="Exemplo-7">Exemplo 7</mh-option>
              <mh-option value="Exemplo-8">Exemplo 8</mh-option>
              <mh-option value="Exemplo-8">Exemplo 9</mh-option>
              <mh-option value="Exemplo-8">Exemplo 10</mh-option>
              <mh-option value="Exemplo-8">Exemplo 11</mh-option>
              <mh-option value="Exemplo-8">Exemplo 12</mh-option>
              <mh-option value="Exemplo-8">Exemplo 13</mh-option>
              <mh-option value="Exemplo-8">Exemplo 14</mh-option>
              <mh-option value="Exemplo-8">Exemplo 15</mh-option>
            </mh-option-group>
          </mh-select>
        </mh-text-field>
      `,
      props: {
        load: boolean('Loader', false),
        disabled: boolean('Disabled', false),
        search: boolean('Search', false),
        optionLabel: text('Text Select', 'Selecione uma opção...'),
        searchLabel:  text('Search Label', 'Busque uma opção...'),
        selected: action('Item Selecionado')
      }
    };
  }, {
    notes: { markdown: markdownNotes },
  }
);
