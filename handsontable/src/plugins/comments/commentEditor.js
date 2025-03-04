import { addClass, outerWidth, outerHeight } from '../../helpers/dom/element';

/**
 * Comment editor for the Comments plugin.
 *
 * @private
 * @class CommentEditor
 */
class CommentEditor {
  static get CLASS_EDITOR_CONTAINER() {
    return 'htCommentsContainer';
  }

  static get CLASS_EDITOR() {
    return 'htComments';
  }

  static get CLASS_INPUT() {
    return 'htCommentTextArea';
  }

  static get CLASS_CELL() {
    return 'htCommentCell';
  }

  constructor(rootDocument, isRtl) {
    this.rootDocument = rootDocument;
    this.isRtl = isRtl;
    this.container = null;
    this.editor = this.createEditor();
    this.editorStyle = this.editor.style;

    this.hidden = true;

    this.hide();
  }

  /**
   * Set position of the comments editor according to the  provided x and y coordinates.
   *
   * @param {number} x X position (in pixels).
   * @param {number} y Y position (in pixels).
   */
  setPosition(x, y) {
    this.editorStyle.left = `${x}px`;
    this.editorStyle.top = `${y}px`;
  }

  /**
   * Set the editor size according to the provided arguments.
   *
   * @param {number} width Width in pixels.
   * @param {number} height Height in pixels.
   */
  setSize(width, height) {
    if (width && height) {
      const input = this.getInputElement();

      input.style.width = `${width}px`;
      input.style.height = `${height}px`;
    }
  }

  /**
   * Returns the size of the comments editor.
   *
   * @returns {{ width: number, height: number }}
   */
  getSize() {
    return {
      width: outerWidth(this.editor),
      height: outerHeight(this.editor),
    };
  }

  /**
   * Reset the editor size to its initial state.
   */
  resetSize() {
    const input = this.getInputElement();

    input.style.width = '';
    input.style.height = '';
  }

  /**
   * Set the read-only state for the comments editor.
   *
   * @param {boolean} state The new read only state.
   */
  setReadOnlyState(state) {
    const input = this.getInputElement();

    input.readOnly = state;
  }

  /**
   * Show the comments editor.
   */
  show() {
    this.editorStyle.display = 'block';
    this.hidden = false;
  }

  /**
   * Hide the comments editor.
   */
  hide() {
    if (!this.hidden) {
      this.editorStyle.display = 'none';
    }

    this.hidden = true;
  }

  /**
   * Checks if the editor is visible.
   *
   * @returns {boolean}
   */
  isVisible() {
    return this.editorStyle.display === 'block';
  }

  /**
   * Set the comment value.
   *
   * @param {string} [value] The value to use.
   */
  setValue(value = '') {
    const comment = value || '';

    this.getInputElement().value = comment;
  }

  /**
   * Get the comment value.
   *
   * @returns {string}
   */
  getValue() {
    return this.getInputElement().value;
  }

  /**
   * Checks if the comment input element is focused.
   *
   * @returns {boolean}
   */
  isFocused() {
    return this.rootDocument.activeElement === this.getInputElement();
  }

  /**
   * Focus the comments input element.
   */
  focus() {
    this.getInputElement().focus();
  }

  /**
   * Create the `textarea` to be used as a comments editor.
   *
   * @returns {HTMLElement}
   */
  createEditor() {
    const editor = this.rootDocument.createElement('div');
    const textArea = this.rootDocument.createElement('textarea');

    editor.style.display = 'none';

    this.container = this.rootDocument.createElement('div');
    this.container.setAttribute('dir', this.isRtl ? 'rtl' : 'ltr');

    addClass(this.container, CommentEditor.CLASS_EDITOR_CONTAINER);

    this.rootDocument.body.appendChild(this.container);

    addClass(editor, CommentEditor.CLASS_EDITOR);
    addClass(textArea, CommentEditor.CLASS_INPUT);

    editor.appendChild(textArea);
    this.container.appendChild(editor);

    return editor;
  }

  /**
   * Get the input element.
   *
   * @returns {HTMLElement}
   */
  getInputElement() {
    return this.editor.querySelector(`.${CommentEditor.CLASS_INPUT}`);
  }

  /**
   * Destroy the comments editor.
   */
  destroy() {
    const containerParentElement = this.container ? this.container.parentNode : null;

    this.editor.parentNode.removeChild(this.editor);
    this.editor = null;
    this.editorStyle = null;

    if (containerParentElement) {
      containerParentElement.removeChild(this.container);
    }
  }
}

export default CommentEditor;
