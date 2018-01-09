var html = require('choo/html')
var accounting = require('accounting')

var appBar = require('../components/appBar')
var styles = require('../styles')

module.exports = function transactions (state, emit) {
  return html`
    <body class=${styles.body}>
      ${appBar()}

      <div class='ph4'>
        ${renderNewTransaction()}
        ${renderTransactionList()}
        ${renderControls()}
      </div>
    </body>
  `

  function renderNewTransaction () {
    return html`
      <div>
        <form class="black-80 mb4">
          Purchased
          ${renderField({
            key: 'amount',
            value: state.newTransaction.amount,
            title: 'Amount'
          }, onFieldChange)}
          ${renderField({
            key: 'currency',
            value: state.newTransaction.currency,
            title: 'Currency'
          }, onFieldChange)}
          for
          ${renderField({
            key: 'usd',
            value: state.newTransaction.usd,
            title: 'USD'
          }, onFieldChange)}
          on
          ${renderField({
            key: 'date',
            value: state.newTransaction.date,
            title: 'Date'
          }, onFieldChange)}
          <button class=${styles.button} onclick=${clickAdd}>Add</button>
        </form>
      </div>
    `
  }

  function renderTransactionList () {
    var style = styles.summary
    var txs = state.transactions.concat().sort(function (a, b) {
      return a.id < b.id
    })

    return html`
      <div>
        <table class=${style.table} cellspacing=0>
          <thead>
            <tr>
              <th class=${style.th}>Date</th>
              <th class=${style.th}>Currency</th>

              <th class='${style.th} tr'>Amount</th>
              <th class='${style.th} tr'>USD</th>
              <th class='${style.th} tr'>Rate</th>
            </tr>
          </thead>
          <tbody class=${style.tbody}>
            ${txs.map(function (row) {
              return html`
                <tr>
                  <td class=${style.td}>${row.date}</td>
                  <td class=${style.td}>${(row.currency || '').toUpperCase()}</td>

                  <td class='${style.metric}'>${accounting.formatNumber(row.amount, 6)}</td>
                  <td class='${style.metric}'>${accounting.formatMoney(row.usd)}</td>
                  <td class='${style.metric}'>${accounting.formatMoney(row.usd / row.amount)}</td>
                </tr>
              `
            })}
          </tbody>
        </table>
      </div>
    `
  }

  function renderControls () {
    return html`
      <div>
        <button class=${styles.button} onclick=${clickExport}>Export</button>
      </div>
    `
  }

  function clickAdd (evt) {
    evt.preventDefault()
    emit('addTransaction')
  }

  function clickExport (evt) {
    emit('exportTransactions')
  }

  function onFieldChange (evt) {
    var key = evt.target.name
    var value = evt.target.value
    emit('changeTransaction', {key, value})
  }
}

function renderField ({key, value, title}, onChange) {
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
