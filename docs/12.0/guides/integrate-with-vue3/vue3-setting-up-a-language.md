---
title: 'Setting up a translation in Vue 3'
metaTitle: 'Setting up a translation in Vue 3 - Guide - Handsontable Documentation'
permalink: /12.0/vue3-setting-up-a-language
canonicalUrl: /vue3-setting-up-a-language
---

# Setting up a translation in Vue 3

## Overview

The following example shows a Handsontable instance with translations set up in Vue 3.

[Find out which Vue 3 versions are supported &#8594;](@/guides/integrate-with-vue3/vue3-installation.md#vue-3-version-support)

## Example

::: example #example1 :vue3-numbro --html 1 --js 2
```html
<div id="example1">
  <hot-table :data="hotData" :settings="settings">
    <hot-column
      title="Product name"
      data="productName"
      width="120"
      read-only="true"
    ></hot-column>
    <hot-column
      title="Price in Japan"
      type="numeric"
      :numeric-format="formatJP"
      data="JP_price"
      width="120"
    ></hot-column>
    <hot-column
      title="Price in Turkey"
      data="TR_price"
      type="numeric"
      :numeric-format="formatTR"
      width="120"
    ></hot-column>
  </hot-table>
</div>
```

```js
import { createApp } from 'vue';
import { HotTable, HotColumn } from '@handsontable/vue3';
import numbro from 'numbro';
import languages from 'numbro/dist/languages.min.js';
import { registerAllModules } from 'handsontable/registry';

import 'handsontable/dist/handsontable.min.css';

// register Handsontable's modules
registerAllModules();

// register the languages you need
numbro.registerLanguage(languages['ja-JP']);
numbro.registerLanguage(languages['tr-TR']);

const app = createApp({
  data() {
    return {
      formatJP: {
        pattern: '0,0.00 $',
        culture: 'ja-JP',
      },
      formatTR: {
        pattern: '0,0.00 $',
        culture: 'tr-TR',
      },
      hotData: [
        {
          productName: 'Product A',
          JP_price: 1.32,
          TR_price: 100.56,
        },
        {
          productName: 'Product B',
          JP_price: 2.22,
          TR_price: 453.5,
        },
        {
          productName: 'Product C',
          JP_price: 3.1,
          TR_price: 678.1,
        },
      ],
      settings: {
        height: 'auto',
        licenseKey: 'non-commercial-and-evaluation'
      }
    };
  },
  components: {
    HotTable,
    HotColumn,
  }
});

app.mount('#example1');
```
:::
