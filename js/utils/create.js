/**
 * @param {String} el
 * @param {String} classNames
 * @param {HTMLElement} child
 * @param {HTMLElement} parent
 * @param {...array} dataAttr
 */
// create function for add elements to HTML file
export default function create(el, classNames, child, parent, ...dataAttr) {
  let element = null;
  try {
    element = document.createElement(el);
  } catch (error) { // catch errors if element cant be create
    throw new Error('Unable to create HTMLElement! Give a proper tag name');
  }
  // classNames must be string with spaces for few (more then one) classes.
  if (classNames) element.classList.add(...classNames.split(' '));
  // child must to be array - every element of array is child
  if (child && Array.isArray(child)) {
    child.forEach((childElement) => childElement && element.appendChild(childElement));
  } else if (child && typeof child === 'object') {
    element.appendChild(child);
  } else if (child && typeof child === 'string') {
    element.innerHTML = child;
  }

  if (parent) {
    parent.appendChild(element);
  }
  // dataAttr will be array of arrays: [['id', 'menu'], ['code', '']]
  // <span id="" data-code="" disabled>
  if (dataAttr.length) {
    dataAttr.forEach(([attrName, attrValue]) => {
      if (attrValue === '') {
        element.setAttribute(attrName, '');
      }
      if (attrName.match(/value|id|placeholder|cols|rows|autocorrect|spellcheck/)) {
        element.setAttribute(attrName, attrValue);
      } else {
        element.dataset[attrName] = attrValue;
      }
    });
  }
  return element;
}
