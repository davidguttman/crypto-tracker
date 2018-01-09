var html = require('choo/html')

var styles = require('../styles')

module.exports = function appBar () {
  var style = styles.appBar

  return html`
    <header class=${style.header}>
      <nav class=${style.nav}>
        <div class=${style.logo}>Crypto Tracker</div>
        <div class=${style.links}>
          <a class=${style.link} href="#summary" title="Summary">Summary</a>
          <a class=${style.linkLast} href="#transactions" title="Transactions">Transactions</a>
        </div>
      </nav>
    </header>
  `
}
