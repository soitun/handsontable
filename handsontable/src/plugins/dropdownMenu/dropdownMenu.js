import { BasePlugin } from '../base';
import { arrayEach } from '../../helpers/array';
import CommandExecutor from '../contextMenu/commandExecutor';
import EventManager from '../../eventManager';
import { hasClass } from '../../helpers/dom/element';
import ItemsFactory from '../contextMenu/itemsFactory';
import Menu from '../contextMenu/menu';
import Hooks from '../../pluginHooks';
import {
  COLUMN_LEFT,
  COLUMN_RIGHT,
  REMOVE_COLUMN,
  CLEAR_COLUMN,
  READ_ONLY,
  ALIGNMENT,
  SEPARATOR
} from '../contextMenu/predefinedItems';

import './dropdownMenu.scss';

Hooks.getSingleton().register('afterDropdownMenuDefaultOptions');
Hooks.getSingleton().register('beforeDropdownMenuShow');
Hooks.getSingleton().register('afterDropdownMenuShow');
Hooks.getSingleton().register('afterDropdownMenuHide');
Hooks.getSingleton().register('afterDropdownMenuExecute');

export const PLUGIN_KEY = 'dropdownMenu';
export const PLUGIN_PRIORITY = 230;
const BUTTON_CLASS_NAME = 'changeType';

/* eslint-disable jsdoc/require-description-complete-sentence */
/**
 * @plugin DropdownMenu
 * @class DropdownMenu
 *
 * @description
 * This plugin creates the Handsontable Dropdown Menu. It allows to create a new row or column at any place in the grid
 * among [other features](@/guides/accessories-and-menus/context-menu.md#context-menu-with-specific-options).
 * Possible values:
 * * `true` (to enable default options),
 * * `false` (to disable completely).
 *
 * or array of any available strings:
 * * `["row_above", "row_below", "col_left", "col_right",
 * "remove_row", "remove_col", "---------", "undo", "redo"]`.
 *
 * See [the dropdown menu demo](@/guides/columns/column-menu.md) for examples.
 *
 * @example
 * ```js
 * const container = document.getElementById('example');
 * const hot = new Handsontable(container, {
 *   data: data,
 *   colHeaders: true,
 *   // enable dropdown menu
 *   dropdownMenu: true
 * });
 *
 * // or
 * const hot = new Handsontable(container, {
 *   data: data,
 *   colHeaders: true,
 *   // enable and configure dropdown menu
 *   dropdownMenu: ['remove_col', '---------', 'make_read_only', 'alignment']
 * });
 * ```
 */

export class DropdownMenu extends BasePlugin {
  static get PLUGIN_KEY() {
    return PLUGIN_KEY;
  }

  static get PLUGIN_PRIORITY() {
    return PLUGIN_PRIORITY;
  }

  static get PLUGIN_DEPS() {
    return [
      'plugin:AutoColumnSize',
    ];
  }

  /**
   * Default menu items order when `dropdownMenu` is enabled by setting the config item to `true`.
   *
   * @returns {Array}
   */
  static get DEFAULT_ITEMS() {
    return [
      COLUMN_LEFT,
      COLUMN_RIGHT,
      SEPARATOR,
      REMOVE_COLUMN,
      SEPARATOR,
      CLEAR_COLUMN,
      SEPARATOR,
      READ_ONLY,
      SEPARATOR,
      ALIGNMENT,
    ];
  }

  constructor(hotInstance) {
    super(hotInstance);
    /**
     * Instance of {@link EventManager}.
     *
     * @private
     * @type {EventManager}
     */
    this.eventManager = new EventManager(this);
    /**
     * Instance of {@link CommandExecutor}.
     *
     * @private
     * @type {CommandExecutor}
     */
    this.commandExecutor = new CommandExecutor(this.hot);
    /**
     * Instance of {@link ItemsFactory}.
     *
     * @private
     * @type {ItemsFactory}
     */
    this.itemsFactory = null;
    /**
     * Instance of {@link Menu}.
     *
     * @private
     * @type {Menu}
     */
    this.menu = null;

    // One listener for enable/disable functionality
    this.hot.addHook('afterGetColHeader', (col, TH) => this.onAfterGetColHeader(col, TH));
  }

  /**
   * Checks if the plugin is enabled in the handsontable settings. This method is executed in {@link Hooks#beforeInit}
   * hook and if it returns `true` than the {@link DropdownMenu#enablePlugin} method is called.
   *
   * @returns {boolean}
   */
  isEnabled() {
    return this.hot.getSettings()[PLUGIN_KEY];
  }

  /**
   * Enables the plugin functionality for this Handsontable instance.
   *
   * @fires Hooks#afterDropdownMenuDefaultOptions
   * @fires Hooks#beforeDropdownMenuSetItems
   */
  enablePlugin() {
    if (this.enabled) {
      return;
    }
    this.itemsFactory = new ItemsFactory(this.hot, DropdownMenu.DEFAULT_ITEMS);

    const settings = this.hot.getSettings()[PLUGIN_KEY];
    const predefinedItems = {
      items: this.itemsFactory.getItems(settings)
    };

    this.registerEvents();

    if (typeof settings.callback === 'function') {
      this.commandExecutor.setCommonCallback(settings.callback);
    }
    super.enablePlugin();

    this.callOnPluginsReady(() => {
      this.hot.runHooks('afterDropdownMenuDefaultOptions', predefinedItems);

      this.itemsFactory.setPredefinedItems(predefinedItems.items);
      const menuItems = this.itemsFactory.getItems(settings);

      if (this.menu) {
        this.menu.destroy();
      }
      this.menu = new Menu(this.hot, {
        className: 'htDropdownMenu',
        keepInViewport: true,
        container: settings.uiContainer || this.hot.rootDocument.body,
      });
      this.hot.runHooks('beforeDropdownMenuSetItems', menuItems);

      this.menu.setMenuItems(menuItems);

      this.menu.addLocalHook('beforeOpen', () => this.onMenuBeforeOpen());
      this.menu.addLocalHook('afterOpen', () => this.onMenuAfterOpen());
      this.menu.addLocalHook('afterClose', () => this.onMenuAfterClose());
      this.menu.addLocalHook('executeCommand', (...params) => this.executeCommand.call(this, ...params));

      // Register all commands. Predefined and added by user or by plugins
      arrayEach(menuItems, command => this.commandExecutor.registerCommand(command.key, command));
    });
  }

  /**
   * Updates the plugin's state.
   *
   * This method is executed when [`updateSettings()`](@/api/core.md#updatesettings) is invoked with any of the following configuration options:
   *  - [`dropdownMenu`](@/api/options.md#dropdownmenu)
   */
  updatePlugin() {
    this.disablePlugin();
    this.enablePlugin();
    super.updatePlugin();
  }

  /**
   * Disables the plugin functionality for this Handsontable instance.
   */
  disablePlugin() {
    this.close();

    if (this.menu) {
      this.menu.destroy();
    }
    super.disablePlugin();
  }

  /**
   * Registers the DOM listeners.
   *
   * @private
   */
  registerEvents() {
    this.eventManager.addEventListener(this.hot.rootElement, 'click', event => this.onTableClick(event));
  }

  /**
   * Opens menu and re-position it based on the passed coordinates.
   *
   * @param {object|Event} position An object with `pageX` and `pageY` properties which contains values relative to
   *                                the top left of the fully rendered content area in the browser or with `clientX`
   *                                and `clientY`  properties which contains values relative to the upper left edge
   *                                of the content area (the viewport) of the browser window. This object is structurally
   *                                compatible with native mouse event so it can be used either.
   * @fires Hooks#beforeDropdownMenuShow
   * @fires Hooks#afterDropdownMenuShow
   */

  open(position) {
    if (!this.menu) {
      return;
    }
    this.menu.open();

    if (position.width) {
      this.menu.setOffset('left', position.width);
    }
    this.menu.setPosition(position);
  }

  /**
   * Closes dropdown menu.
   */
  close() {
    if (!this.menu) {
      return;
    }
    this.menu.close();
  }

  /**
   * Executes context menu command.
   *
   * You can execute all predefined commands:
   *  * `'row_above'` - Insert row above
   *  * `'row_below'` - Insert row below
   *  * `'col_left'` - Insert column left
   *  * `'col_right'` - Insert column right
   *  * `'clear_column'` - Clear selected column
   *  * `'remove_row'` - Remove row
   *  * `'remove_col'` - Remove column
   *  * `'undo'` - Undo last action
   *  * `'redo'` - Redo last action
   *  * `'make_read_only'` - Make cell read only
   *  * `'alignment:left'` - Alignment to the left
   *  * `'alignment:top'` - Alignment to the top
   *  * `'alignment:right'` - Alignment to the right
   *  * `'alignment:bottom'` - Alignment to the bottom
   *  * `'alignment:middle'` - Alignment to the middle
   *  * `'alignment:center'` - Alignment to the center (justify).
   *
   * Or you can execute command registered in settings where `key` is your command name.
   *
   * @param {string} commandName Command name to execute.
   * @param {*} params Additional parameters passed to the command executor.
   */
  executeCommand(commandName, ...params) {
    this.commandExecutor.execute(commandName, ...params);
  }

  /**
   * Turns on / off listening on dropdown menu.
   *
   * @private
   * @param {boolean} listen Turn on listening when value is set to true, otherwise turn it off.
   */
  setListening(listen = true) {
    if (this.menu.isOpened()) {
      if (listen) {
        this.menu.hotMenu.listen();
      } else {
        this.menu.hotMenu.unlisten();
      }
    }
  }

  /**
   * Table click listener.
   *
   * @private
   * @param {Event} event The mouse event object.
   */
  onTableClick(event) {
    event.stopPropagation();

    if (hasClass(event.target, BUTTON_CLASS_NAME) && !this.menu.isOpened()) {
      let offsetTop = 0;
      let offsetLeft = 0;

      if (this.hot.rootDocument !== this.menu.container.ownerDocument) {
        const { frameElement } = this.hot.rootWindow;
        const { top, left } = frameElement.getBoundingClientRect();

        offsetTop = top;
        offsetLeft = left;
      }

      const rect = event.target.getBoundingClientRect();

      this.open({
        left: rect.left + offsetLeft,
        top: rect.top + event.target.offsetHeight + 3 + offsetTop,
        width: rect.width,
        height: rect.height,
      });
    }
  }

  /**
   * On after get column header listener.
   *
   * @private
   * @param {number} col Visual column index.
   * @param {HTMLTableCellElement} TH Header's TH element.
   */
  onAfterGetColHeader(col, TH) {
    // Corner or a higher-level header
    const headerRow = TH.parentNode;

    if (!headerRow) {
      return;
    }

    const headerRowList = headerRow.parentNode.childNodes;
    const level = Array.prototype.indexOf.call(headerRowList, headerRow);

    if (col < 0 || level !== headerRowList.length - 1) {
      return;
    }

    const existingButton = TH.querySelector(`.${BUTTON_CLASS_NAME}`);

    // Plugin enabled and buttons already exists, return.
    if (this.enabled && existingButton) {
      return;
    }
    // Plugin disabled and buttons still exists, so remove them.
    if (!this.enabled) {
      if (existingButton) {
        existingButton.parentNode.removeChild(existingButton);
      }

      return;
    }
    const button = this.hot.rootDocument.createElement('button');

    button.className = BUTTON_CLASS_NAME;

    // prevent page reload on button click
    button.onclick = function() {
      return false;
    };

    TH.firstChild.insertBefore(button, TH.firstChild.firstChild);
  }

  /**
   * On menu before open listener.
   *
   * @private
   * @fires Hooks#beforeDropdownMenuShow
   */
  onMenuBeforeOpen() {
    this.hot.runHooks('beforeDropdownMenuShow', this);
  }

  /**
   * On menu after open listener.
   *
   * @private
   * @fires Hooks#afterDropdownMenuShow
   */
  onMenuAfterOpen() {
    this.hot.runHooks('afterDropdownMenuShow', this);
  }

  /**
   * On menu after close listener.
   *
   * @private
   * @fires Hooks#afterDropdownMenuHide
   */
  onMenuAfterClose() {
    this.hot.listen();
    this.hot.runHooks('afterDropdownMenuHide', this);
  }

  /**
   * Destroys the plugin instance.
   */
  destroy() {
    this.close();

    if (this.menu) {
      this.menu.destroy();
    }
    super.destroy();
  }
}

DropdownMenu.SEPARATOR = {
  name: SEPARATOR
};
