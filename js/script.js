/* eslint-disable import/extensions */
import { get } from './storage.js';
import Keyboard from './Keyboard.js';

const rowsOrder = [
    ['Backquote', 'Digit1', ],
    ['Tab', 'KeyQ', ],
];

const lang = get('kbLang', '"ru"');

new Keyboard(rowsOrder).init(lang).generateLayout();