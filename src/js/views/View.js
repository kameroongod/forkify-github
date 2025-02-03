import icons from "url:../../img/icons.svg";

export default class View {
  _data;

  /**
   * Render the received object to the DOM
   * @param {Object | Object[]} data The data to be rendered (e.g. recipe)
   * @param {boolean} [render=true] If false, create markup string instead of rendering to the DOM
   * @returns {undefined | string} A markup string is returned if render=false
   * @this {Object} View instance
   * @author Maxime
   * @todo Finish implementation
   */
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();
    this._data = data;
    const markup = this._generateMarkup();
    if (!render) return markup;
    this._clear();
    // Insert markup in html
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  // Function to only update part of the dom that is different in new markup vs old markup
  update(data) {
    // if (!data || (Array.isArray(data) && data.length === 0))
    //   return this.renderError();
    this._data = data;
    const newMarkup = this._generateMarkup();
    // Convert string into new DOM object in memory (not on page)
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = newDOM.querySelectorAll("*");
    const curElements = this._parentElement.querySelectorAll("*");
    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      // Update changed text
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ""
      ) {
        curEl.textContent = newEl.textContent;
      }
      // Update changed attributes
      // Loop over each attribute of new element which isn't matching current element and apply the attributes on current element
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach((attr) =>
          curEl.setAttribute(attr.name, attr.value)
        );
      }
    });
    this._clear();
    // Insert markup in html
    this._parentElement.insertAdjacentHTML("afterbegin", newMarkup);
  }

  _clear() {
    // To first remove the text that was in container
    this._parentElement.innerHTML = "";
  }

  // Function to render spinner while waiting for data
  renderSpinner() {
    const markup = `
                  <div class="spinner">
                  <svg>
                    <use href="${icons}#icon-loader"></use>
                  </svg>
                </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  renderError(message = this._errorMessage) {
    const markup = `<div class="error">
                  <div>
                    <svg>
                      <use href="${icons}#icon-alert-triangle"></use>
                    </svg>
                  </div>
                  <p>${message}</p>
                </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  renderMessage(message = this._successMessage) {
    const markup = `<div class="message">
                <div>
                  <svg>
                    <use href="${icons}#icon-smile"></use>
                  </svg>
                </div>
                <p>${message}</p>
              </div>
      `;
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }
}
