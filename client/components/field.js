var html = require('choo/html')
var styles = require('../styles')

module.exports = function field ({key, value, title}, onChange) {
  return html`
    <span>
      <input
        name=${key}
        class=${styles.input}
        type='text'
        placeholder=${title || key}
        value=${value || ''}
        onchange=${onChange}/>
    </span>
  `
}
