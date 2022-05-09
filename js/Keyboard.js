/* eslint-disable linebreak-style */
/* eslint-disable eol-last */
/* eslint-disable no-param-reassign */
/* eslint-disable import/extensions */
import * as storage from './storage.js';
import create from './utils/create.js';
import language from './layouts/index.js';
import Key from './Key.js';

const MSG_EN = 'Use <kbd>Alt</kbd> + <kbd>Shift</kbd> to switch language.';
const MSG_RU = 'Для смены языковой раскладки используйте Alt+Shift.';
const MSGS = [MSG_RU, MSG_EN];


const main = create(
  'main',
  '',
  [create('h1', 'title', 'Virtual Keyboard')],
);
const footer = create('footer', '', [create('h4', 'subtitle', 'Virtual keyboard. Made under Windows.'),
create('p', 'hint', MSGS[1])]);

export default class Keyboard {
  constructor(rowsOrder) {
    this.rowsOrder = rowsOrder;
    this.keysPressed = {};
    this.isCaps = false;
  }

  init(langCode) {
    this.keyBase = language[langCode];
    this.output = create(
      'textarea',
      'output',
      null,
      main,
      ['placeholder', 'Type something here. Use your real keyboard or mouse-click.'],
      ['rows', 8],
      ['cols', 50],
      ['spellcheck', false],
      ['autocorrect', 'off'],
    );
    this.container = create('div', 'keyboard', null, main, ['language', langCode]);
    document.body.prepend(footer);
    document.body.prepend(main);
    
    
    return this;
  }
  
  generateLayout() {
    this.keyButtons = [];
    this.rowsOrder.forEach((row, i) => {
      const rowElement = create('div', 'keyboard__row', null, this.container, ['row', i + 1]);
      rowElement.style.gridTemplateColumns = `repeat(${row.length}, 1fr)`;
      row.forEach((code) => {
        const keyObj = this.keyBase.find((key) => key.code === code);
        if (keyObj) {
          const keyButton = new Key(keyObj);
          this.keyButtons.push(keyButton);
          rowElement.appendChild(keyButton.div);
        }
      });
    });
    document.addEventListener('keydown', this.handleEvent);
    document.addEventListener('keyup', this.handleEvent);
    this.container.onmousedown = this.preHandleEvent;
    this.container.onmouseup = this.preHandleEvent;
  }

  preHandleEvent = (event) => {
    event.stopPropagation();
    const keyDiv = event.target.closest('.keyboard__key');
    if (!keyDiv) return;
    const { dataset: { code } } = keyDiv; //const code = keyDiv.dataset.code;
    keyDiv.addEventListener('mouseleave', this.resetButtonState);
    this.handleEvent({ code, type: event.type });
  };

  // remove class active from buttons after mouseleave event becouse of they stay active after mouseleave
  resetButtonState = ({ target: {dataset: { code }}}) => {
    const keyObj = this.keyButtons.find((key) => key.code === code);
    if (!this.isCaps) keyObj.div.classList.remove('active');
    keyObj.div.removeEventListener('mouseleave', this.resetButtonState); 
  };



  handleEvent = (event) => {
    if (event.stopPropagation) event.stopPropagation();
    const { code, type } = event;
    const keyObj = this.keyButtons.find((key) => key.code === code);
    if (!keyObj) return;
    this.output.focus();

    // keydown events
    if (type.match(/keydown|mousedown/)) {
      if (type.match(/key/)) event.preventDefault();

      // event for shiftKey down 
      if (code.match(/Shift/)) this.shiftKey = true;
      if (this.shiftKey) this.switchUpperCase(true);

      keyObj.div.classList.add('active');
      

      // CapsLock on - off
      if (code.match(/Caps/) && !this.isCaps) {
        this.isCaps = true;
        this.switchUpperCase(true);
      } else if (code.match(/Caps/) && this.isCaps) {
        this.isCaps = false;
        this.switchUpperCase(false);
        keyObj.div.classList.remove('active');
      }


      // switch lang
      if (code.match(/Alt/)) this.altKey = true;
      if (code.match(/Shift/)) this.shiftKey = true;
      if (code.match(/Arrow/)) this.isArrow = true;

      if (code.match(/Alt/) && this.shiftKey) this.swithLanguage();
      if (code.match(/Shift/) && this.altKey) this.swithLanguage();

      if (!this.isCaps) {
        if (!this.isArrow) {
          this.printToOutput(keyObj, this.shiftKey ? keyObj.shift : keyObj.small);
        } else {
          this.printToOutput(keyObj, keyObj.small);
        }
      } else if (this.isCaps) {
          if (this.isArrow) {
            this.printToOutput(keyObj, keyObj.small);
          } else if (this.shiftKey) {
          this.printToOutput(keyObj, keyObj.sub.innerHTML ? keyObj.shift : keyObj.small);
        } else {
          this.printToOutput(keyObj, !keyObj.sub.innerHTML ? keyObj.shift : keyObj.small);
        }
      }


    } else if (type.match(/keyup|mouseup/)) {
      // delete class active for all keys accept Caps when keyUp event
      if (!code.match(/Caps/)) keyObj.div.classList.remove('active');
      
      if (code.match(/Alt/)) this.altKey = false;
      if (code.match(/Shift/)) {
        this.shiftKey = false;
        this.switchUpperCase(false);      
      }
    }
  }

  swithLanguage = () => {
    const langAbbr = Object.keys(language);
    let langIndex = langAbbr.indexOf(this.container.dataset.language);
    this.keyBase = langIndex + 1 < langAbbr.length ? language[langAbbr[langIndex += 1]] : language[langAbbr[langIndex -= langIndex]];
    this.container.dataset.language = langAbbr[langIndex];
    storage.set('kbLang', langAbbr[langIndex]);
    footer.lastChild.innerHTML = MSGS[langIndex];

    this.keyButtons.forEach((button) => {
      const keyObj = this.keyBase.find((key) => key.code === button.code);
      if (!keyObj) return;
      button.shift = keyObj.shift;
      button.small = keyObj.small;
      // replace sub symbol for switch language and remove sub symbol for ru letters
      if (keyObj.shift && keyObj.shift.match(/[^a-zA-Zа-яА-ЯёЁ]/g)) {
        button.sub.innerHTML = keyObj.shift;
      } else { 
        button.sub.innerHTML = '';
      }
      button.letter.innerHTML = keyObj.small;
    });

    if (this.isCaps) this.switchUpperCase(true);
  }
  // Shift - UpperCase for KeyDown Shift Button

 switchUpperCase(isTrue) {
  if (isTrue) {
    this.keyButtons.forEach((button) => {
      if (button.sub) {
        if (this.shiftKey) {
          button.sub.classList.add('sub-active');
          button.letter.classList.add('sub-inactive');
        }
      }
       if (!button.isFnKey && this.isCaps && !this.shiftKey && !button.sub.innerHTML && button.shift) {
        button.letter.innerHTML = button.shift;
      } else if (!button.isFnKey && this.isCaps && this.shiftKey) {
        button.letter.innerHTML = button.small;
      } else if (!button.isFnKey && !button.sub.innerHTML && button.shift) {
        button.letter.innerHTML = button.shift;
      } 
    });
  } else {
    this.keyButtons.forEach((button) => {
      if (button.sub.innerHTML && !button.isFnKey) {
        button.sub.classList.remove('sub-active');
        button.letter.classList.remove('sub-inactive');

      } else if (!button.isFnKey) {
        if (this.isCaps && button.shift) {
          button.letter.innerHTML = button.shift;
        } else {
          button.letter.innerHTML = button.small;
        }
      } 
    });
  }
 } 


  //output to textarea
  printToOutput(keyObj, symbol) {
    let cursorPos = this.output.selectionStart;
    const left = this.output.value.slice(0, cursorPos);
    const right = this.output.value.slice(cursorPos);
    
    const fnButtonsHandler = {
      Tab: () => {
        this.output.value = `${left}\t${right}`;
        cursorPos++;
      },
      ArrowLeft: () => {
        cursorPos = cursorPos - 1 >= 0 ? cursorPos - 1 : 0;
      },
      ArrowRight: () => {
        cursorPos += 1;
      },
     
      Enter: () => {
        this.output.value = `${left}\n${right}`;
        cursorPos +=1;
      },
      Backspace: () => {
        this.output.value = `${left.slice(0, -1)}${right}`;
        cursorPos -= 1;
      },
      Delete: () => {
        this.output.value = `${left}${right.slice(1)}`;
      },
      Space: () => {
        this.output.value = `${left} ${right}`;
        cursorPos++;
      }
    }
    
    if (fnButtonsHandler[keyObj.code]) fnButtonsHandler[keyObj.code]();
    else if (!keyObj.isFnKey) {
      cursorPos++;
      this.output.value = `${left}${symbol}${right}`;
    }
    this.output.setSelectionRange(cursorPos, cursorPos);
  }
}
