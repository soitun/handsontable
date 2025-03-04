---
title: 'Referencing the Handsontable instance in Vue 2'
metaTitle: 'Referencing the Handsontable instance in Vue 2 - Guide - Handsontable Documentation'
permalink: /next/vue-hot-reference
canonicalUrl: /vue-hot-reference
---

# Referencing the Handsontable instance in Vue 2

[[toc]]

## Overview

The following example implements the `@handsontable/vue`, showing how to reference the Handsontable instance from the wrapper component.

## Example

::: example #example1 :vue --html 1 --js 2
```html
<div id="example1">
  <hot-table ref="hotTableComponent" :settings="hotSettings"></hot-table><br/>
  <button v-on:click="swapHotData" class="controls">Load new data!</button>
</div>
```
```js
import Vue from 'vue';
import { HotTable } from '@handsontable/vue';
import { registerAllModules } from 'handsontable/registry';
import { createSpreadsheetData } from './helpers';

// register Handsontable's modules
registerAllModules();

new Vue({
  el: '#example1',
  data: function() {
    return {
      hotSettings: {
        data: createSpreadsheetData(4, 4),
        colHeaders: true,
        height: 'auto',
        licenseKey: 'non-commercial-and-evaluation'
      }
    }
  },
  methods: {
    swapHotData: function() {
      // The Handsontable instance is stored under the `hotInstance` property of the wrapper component.
      this.$refs.hotTableComponent.hotInstance.loadData([['new', 'data']]);
    }
  },
  components: {
    HotTable
  }
});
```
:::
