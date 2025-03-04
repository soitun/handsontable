---
title: 'Using the `HotColumn` component in Vue 2'
metaTitle: 'Using the HotColumn component in Vue 2 - Guide - Handsontable Documentation'
permalink: /12.0/vue-hot-column
canonicalUrl: /vue-hot-column
---

# Using the `HotColumn` component in Vue 2

[[toc]]

## Overview

You can configure the column-related settings using the `HotColumn` component's attributes. You can also create custom renderers and editors using Vue components.

## Declaring column settings

To declare column-specific settings, pass the settings as `hot-column` properties, either separately or wrapped as a `settings` property, exactly as you would for `hot-table`.

::: example #example1 :vue --html 1 --js 2
```html
<div id="example1">
  <hot-table :settings="hotSettings">
    <hot-column title="First column header">
    </hot-column>
    <hot-column :settings="secondColumnSettings" read-only="true">
    </hot-column>
  </hot-table>
</div>
```

```js
import Vue from 'vue';
import { HotTable, HotColumn } from '@handsontable/vue';
import { registerAllModules } from 'handsontable/registry';
import { createSpreadsheetData } from './helpers';

// register Handsontable's modules
registerAllModules();

new Vue({
  el: '#example1',
  data: function() {
    return {
      hotSettings: {
        data: createSpreadsheetData(10, 10),
        height: 'auto',
        licenseKey: 'non-commercial-and-evaluation',
      },
      secondColumnSettings: {
        title: 'Second column header',
      },
    }
  },
  components: {
    HotTable,
    HotColumn
  }
});
```
:::

## Array of objects

To work with an array of objects for the `hot-column` component, you need to provide precise information about the data structure for the columns. To do this, refer to the data for a column in properties as `data`.

::: example #example2 :vue --html 1 --js 2
```html
<div id="example2">
  <hot-table :data="hotData" :settings="settings">
    <hot-column title="ID" data="id">
    </hot-column>
    <hot-column :settings="secondColumnSettings" read-only="true" data="name">
    </hot-column>
    <hot-column title="Price" data="payment.price">
    </hot-column>
    <hot-column title="Currency" data="payment.currency">
    </hot-column>
  </hot-table>
</div>
```
```js
import Vue from 'vue';
import { HotTable, HotColumn } from '@handsontable/vue';

new Vue({
  el: '#example2',
  data() {
    return {
      hotData: [
        { id: 1, name: 'Table tennis racket', payment: { price: 13, currency: 'PLN' } },
        { id: 2, name: 'Outdoor game ball', payment: { price: 14, currency: 'USD' } },
        { id: 3, name: 'Mountain bike', payment: { price: 300, currency: 'USD' } }
      ],
      secondColumnSettings: {
        title: 'Second column header'
      },
      settings: {
        height: 'auto',
        licenseKey: 'non-commercial-and-evaluation'
      }
    }
  },
  components: {
    HotTable,
    HotColumn
  }
});
```
:::

## Declaring a custom renderer as a component

The wrapper allows creating custom renderers using Vue 2 components. The data you would normally get as arguments of the rendering function will be injected into the rendering component's `$data` object.

To mark a component as a Handsontable renderer, simply add a `hot-renderer` attribute to it.

::: tip
Handsontable's `autoRowSize` and `autoColumnSize` options require calculating the widths/heights of some of the cells before rendering them into the table. For this reason, it's not currently possible to use them alongside component-based renderers, as they're created after the table's initialization.

Be sure to turn those options off in your Handsontable config, as keeping them enabled may cause unexpected results. Please note that `autoColumnSize` is enabled by default.
:::

::: example #custom-renderer-example :vue --html 1 --js 2
```html
<div id="custom-renderer-example">
  <hot-table :settings="hotSettings">
    <hot-column :width="250">
      <custom-renderer hot-renderer></custom-renderer>
    </hot-column>
  </hot-table>
</div>
```
```js
import Vue from 'vue';
import { HotTable, HotColumn } from '@handsontable/vue';
import { createSpreadsheetData } from './helpers';

const CustomRenderer = {
  template: '<div><i style="color: #a9a9a9">Row: {{row}}, column: {{col}},</i> value: {{value}}</div>',
  data() {
    return {
      // We'll need to define properties in our data object,
      // corresponding to all of the data being injected from
      // the BaseEditorComponent class, which are:
      // - hotInstance (instance of Handsontable)
      // - row (row index)
      // - col (column index)
      // - prop (column property name)
      // - TD (the HTML cell element)
      // - cellProperties (the cellProperties object for the edited cell)
      hotInstance: null,
      TD: null,
      row: null,
      col: null,
      prop: null,
      value: null,
      cellProperties: null
    }
  }
};

const App = new Vue({
  el: '#custom-renderer-example',
  data() {
    return {
      hotSettings: {
        data: createSpreadsheetData(10, 10),
        autoRowSize: false,
        autoColumnSize: false,
        height: 'auto',
        licenseKey: 'non-commercial-and-evaluation',
      }
    }
  },
  components: {
    HotTable,
    HotColumn,
    CustomRenderer
  }
});
```
:::

**Note:** For the cell renderers to be independent, renderer components are created for each displayed cell - all of them being clones of the "original" renderer component. For performance reasons, these are cached using the LRU algorithm, which stores a certain amount of entries and overwrites the least recently used ones with fresh ones.

By default, the number of entries available for the cache is set to `3000`, which means 3000 cells can be rendered simultaneously while being read from the cache. However, for larger tables, some of the cells may not be able to be cached, and therefore, their corresponding component would be recreated each time a cell is rendered - this is not great for performance.

To prevent this problem, it is possible to pass the `wrapperRendererCacheSize` option to the `HotTable` component and set it to a number of entries available in the renderer cache.

## Declaring a custom editor as a component

You can also utilize the Vue 2 components to create custom editors. To do so, you'll need to create a component compatible with Handsontable's editor class structure. The easiest way to do so is to extend `BaseEditorComponent` - a base editor component exported from `@handsontable/vue`.

This will give you a solid base to build on. Note that the editor component needs to tick all of the boxes that a regular editor does, such as defining the `getValue`, `setValue`, `open`, `close`, and `focus` methods. These are abstract in the `BaseEditor`. For more info, check the documentation on [creating custom editors from scratch](@/guides/cell-functions/cell-editor.md#selecteditor-creating-editor-from-scratch).

::: example #custom-editor-example :vue --html 1 --js 2
```html
<div id="custom-editor-example">
  <hot-table :settings="hotSettings">
    <hot-column :width="250">
      <custom-editor hot-editor></custom-editor>
    </hot-column>
  </hot-table>
</div>

<script type="text/x-template" id="editor-template">
  // We're binding the `style` attribute to the style object in our component's data
  // as well as the `mousedown` event to a function, which stops the event propagation
  // in order to prevent closing the editor on click.
  <div v-if="isVisible" id="editorElement" :style="style" v-on:mousedown="stopMousedownPropagation" >
    <button v-on:click="setLowerCase">{{ value.toLowerCase() }}</button>
    <button v-on:click="setUpperCase">{{ value.toUpperCase() }}</button>
  </div>
</script>
```
```js
import Vue from 'vue';
import { HotTable, HotColumn, BaseEditorComponent } from '@handsontable/vue';

const CustomEditor = {
  name: 'CustomEditor',
  template: '#editor-template',
  extends: BaseEditorComponent,
  data() {
    return {
      // We'll need to define properties in our data object,
      // corresponding to all of the data being injected from
      // the BaseEditorComponent class, which are:
      // - hotInstance (instance of Handsontable)
      // - row (row index)
      // - col (column index)
      // - prop (column property name)
      // - TD (the HTML cell element)
      // - originalValue (cell value passed to the editor)
      // - cellProperties (the cellProperties object for the edited cell)
      hotInstance: null,
      TD: null,
      row: null,
      col: null,
      prop: null,
      originalValue: null,
      value: '',
      cellProperties: null,
      isVisible: false,
      style: {
        position: 'absolute',
        padding: '15px',
        background: '#fff',
        zIndex: 999,
        border: '1px solid #000'
      }
    }
  },
  methods: {
    stopMousedownPropagation(e) {
      e.stopPropagation();
    },
    prepare(row, col, prop, td, originalValue, cellProperties) {
      // We'll need to call the `prepare` method from
      // the `BaseEditorComponent` class, as it provides
      // the component with the information needed to use the editor
      // (hotInstance, row, col, prop, TD, originalValue, cellProperties)
      BaseEditorComponent.options.methods.prepare.call(this, row, col, prop, td, originalValue, cellProperties);

      if (!document.body.contains(this.$el)) {
        document.body.appendChild(this.$el);
      }

      const tdPosition = td.getBoundingClientRect();

      // As the `prepare` method is triggered after selecting
      // any cell, we're updating the styles for the editor element,
      // so it shows up in the correct position.
      this.style.left = tdPosition.left + window.pageXOffset + 'px';
      this.style.top = tdPosition.top + window.pageYOffset + 'px';
    },
    setLowerCase() {
      this.setValue(this.value.toLowerCase());
      this.finishEditing();
    },
    setUpperCase() {
      this.setValue(this.value.toUpperCase());
      this.finishEditing();
    },
    open() {
      this.isVisible = true;
    },
    close() {
      this.isVisible = false;
    },
    setValue(value) {
      this.value = value;
    },
    getValue() {
      return this.value;
    }
  }
};

const App = new Vue({
  el: '#custom-editor-example',
  data() {
    return {
      hotSettings: {
        data: [
          ['Obrien Fischer'], ['Alexandria Gordon'], ['John Stafford'], ['Regina Waters'], ['Kay Bentley'], ['Emerson Drake'], ['Deann Stapleton']
        ],
        licenseKey: 'non-commercial-and-evaluation',
        rowHeaders: true,
        height: 'auto',
      }
    }
  },
  components: {
    HotTable,
    HotColumn,
    CustomEditor
  }
});
```
:::

## Using the renderer/editor components with `v-model`

You can also use Vue 2's `v-model` with the renderer and editor components.

In the example below, we're utilizing an input with `v-model` assigned and reading the bound property from the renderer component to highlight the rows entered into the input.

List of row indexes (starting from 0):

::: example #v-model-example :vue --html 1 --js 2
```html
<div id="v-model-example">
  <label for="mainInput">List of row indexes (starting from 0):</label><br>
    <input id="mainInput" v-model="highlightedRows"/>

    <br><br>

    <hot-table :settings="hotSettings" :row-headers="true" :col-headers="true">
      <hot-column :width="50">
        <custom-renderer hot-renderer></custom-renderer>
      </hot-column>
    </hot-table>
</div>
```
```js
import Vue from 'vue';
import { HotTable, HotColumn } from '@handsontable/vue';
import { createSpreadsheetData } from './helpers';

const CustomRenderer = {
  template: `<div v-bind:style="{ backgroundColor: bgColor }">{{value}}</div>`,
  data() {
    return {
      hotInstance: null,
      TD: null,
      row: null,
      col: null,
      prop: null,
      value: null,
      cellProperties: null
    }
  },
  computed: {
    bgColor() {
      return this.$root.highlightedRows.includes(this.row) ? '#40b882' : '#fff';
    }
  }
};

const App = new Vue({
  el: '#v-model-example',
  data() {
    return {
      hotSettings: {
        data: createSpreadsheetData(10, 1)  ,
        licenseKey: 'non-commercial-and-evaluation',
        autoRowSize: false,
        autoColumnSize: false,
        height: 'auto',
      },
      highlightedRows: ''
    }
  },
  components: {
    HotTable,
    HotColumn,
    CustomRenderer
  }
});
```
:::

## A more advanced example

In this example, several capabilities of the wrapper are combined:

1. Create a custom editor component with an external dependency that will act as both renderer and editor
2. Declare settings for several columns using Vue 2's `v-for`
3. Create a component where the state will be bound by the data retrieved from the first component

::: example #advanced-editor-example :vue-advanced --html 1 --css 2 --js 3
```html
<div id="advanced-editor-example" class="hot">
  <hot-table :settings="hotSettings">
    <hot-column :width="100">
      <stars-renderer hot-renderer></stars-renderer>
    </hot-column>
    <hot-column v-for="n in 2" :width="150" v-bind:key="'col' + n">
      <color-picker hot-editor hot-renderer></color-picker>
    </hot-column>
  </hot-table>
</div>
```
```css
#colorPickerElement button {
  width: 100%;
  height: 33px;
  margin-top: 10px;
}

.vc-chrome {
  box-shadow: none;
}
```
```js
import Vue from 'vue';
import Vuex from 'vuex';
import { HotTable, HotColumn, BaseEditorComponent } from '@handsontable/vue';
import { Chrome } from 'vue-color';
import Component from 'vue-class-component';
import StarRating from 'vue-star-rating';

// ColorPicker.vue
@Component({
  components: {
    Chrome,
  },
  template: `
    <div style="display: flex">
      <div
        v-if="isEditor && isVisible"
        id="colorPickerElement"
        :style="style"
        @mousedown="stopMousedownPropagation"
      >
        <chrome :value="value" @input="updateColor"></chrome>
        <button v-on:click="applyColor">Apply</button>
      </div>
      <div v-if="isRenderer">
        <div
          :style="{background: value, width: '21px', height: '21px', float: 'left', marginRight: '5px'}"
        ></div>
        <span>{{value}}</span>
      </div>
    </div>
  `
})
class ColorPicker extends BaseEditorComponent {
  hotInstance = null;
  TD = null;
  row = null;
  col = null;
  prop = null;
  value = '';
  cellProperties = null;
  isEditor = null;
  isRenderer = null;
  editorElement = null;
  isVisible = false;
  style = {
    position: 'absolute',
    padding: '15px',
    background: '#fff',
    zIndex: 999,
    border: '1px solid #000',
    left: '0px',
    top: '0px'
  };

  stopMousedownPropagation(e) {
    e.stopPropagation();
  }

  prepare(row, col, prop, td, originalValue, cellProperties) {
    BaseEditorComponent.options.methods.prepare.call(
      this,
      row,
      col,
      prop,
      td,
      originalValue,
      cellProperties
    );

    const tdPosition = td.getBoundingClientRect();

    this.style.left = tdPosition.left + window.pageXOffset + 'px';
    this.style.top = tdPosition.top + window.pageYOffset + 'px';
  }

  updateColor(info) {
    this.setValue(info.hex);
  }

  applyColor() {
    if (this.col === 1) {
      this.$store.commit('setActiveStarColor', {
        row: this.row,
        newColor: this.getValue()
      });
    } else if (this.col === 2) {
      this.$store.commit('setInactiveStarColor', {
        row: this.row,
        newColor: this.getValue()
      });
    }
    this.finishEditing();
  }

  open() {
    this.isVisible = true;
  }

  close() {
    this.applyColor();
    this.isVisible = false;
  }

  setValue(value) {
    this.value = value;
  }

  getValue() {
    return this.value;
  }
}

// StarsRenderer.vue
@Component({
  components: {
    StarRating,
  },
  template: `
    <div class="rating-renderer">
      <star-rating
        v-on:rating-selected="saveRating"
        :rating="rating"
        :star-size="15"
        :show-rating="false"
        :active-color="this.$store.state.activeColors[this.row]"
        :inactive-color="this.$store.state.inactiveColors[this.row]"
      ></star-rating>
    </div>
  `
})
class StarsRenderer extends Vue {
  hotInstance = null;
  row = null;
  col = null;
  value = 0;

  get rating() {
    return parseInt(this.value, 10);
  }

  set rating(newValue) {
    this.value = parseInt(newValue, 10);
  }

  saveRating(newRating) {
    this.hotInstance.setDataAtCell(this.row, this.col, newRating);
  }
}

// App.vue + main.js
Vue.use(Vuex);

const App = new Vue({
  el: '#advanced-editor-example',
  data() {
    return {
      hotSettings: {
        data: [
          [1, '#2269EC', '#E1E7F3'],
          [2, '#A1E3CD', '#E5ECE4'],
          [3, '#A7DEA2', '#E4E8DA'],
          [4, '#ABE025', '#D4E1E6'],
          [5, '#018FC5', '#E8D3D7'],
          [5, '#FF1E49', '#D0D7E4']
        ],
        fillHandle: false,
        copyPaste: false,
        licenseKey: 'non-commercial-and-evaluation',
        rowHeaders: true,
        colHeaders: ['Rating', 'Active star color', 'Inactive star color'],
        autoRowSize: false,
        autoColumnSize: false,
        height: 'auto',
      }
    };
  },
  created() {
    this.$store.commit('initStarColors', this.hotSettings.data);
  },
  store: new Vuex.Store({
    state: {
      activeColors: [],
      inactiveColors: []
    },
    mutations: {
      initStarColors(state, hotData) {
        for (let i = 0; i < hotData.length; i++) {
          state.activeColors[i] = hotData[i][1];
          state.inactiveColors[i] = hotData[i][2];
        }
      },
      setActiveStarColor(state, payload) {
        Vue.set(state.activeColors, payload.row, payload.newColor);
      },
      setInactiveStarColor(state, payload) {
        Vue.set(state.inactiveColors, payload.row, payload.newColor);
      }
    }
  }),
  components: {
    HotTable,
    HotColumn,
    ColorPicker,
    StarsRenderer,
  }
});
```
:::

### 1. Editor component with an external dependency, which will act as both renderer and editor

To use an external editor component with Handsontable, you'll need to create an additional "bridge" component to connect your dependencies and Handsontable's API. This example uses an external color-picker component, [vue-color](https://github.com/xiaokaike/vue-color).

The editor implementation is pretty straightforward: you need to import your dependency, place it in your editor template and attach its events to your editor logic, and you're done!

In our case, we're also adding an "Apply" button, which triggers the Handsontable base editor's `finishEditing` method, so all the heavy lifting regarding passing the new value to the dataset is done for us.

Finally, modify the component template to be used as a renderer _and_ editor. We'll utilize the `isEditor` and `isRenderer` properties, injected into the component instances created by the wrapper. The template will be divided into a render and editor part using Vue's `v-if`.

This component contains some Vuex state logic. Ignore it for now. We'll cover this in the third step.

### 2. Using `v-for` for column declaration

`v-for` is used to declare the second and third columns in a loop. You can bind the loop to your data and retrieve the settings from there.

```html
<hot-table :settings="hotSettings">
  <hot-column :width="120">
    <stars-rating hot-renderer></stars-rating>
  </hot-column>
  <hot-column v-for="n in 2" :width="120" v-bind:key="'col' + n">
    <color-picker hot-editor hot-renderer></color-picker>
  </hot-column>
</hot-table>
```

### 3. Binding the state between components.

As you can see in our first editor/renderer component, we're already committing all of the changes into the applications `$store`. This way, we can easily bind the state of our new component (based on a star-rating component dependency) to the data in the second and third columns.
