var html = require('choo/html')
var accounting = require('accounting')

var styles = require('../styles')
var pivot = require('../components/pivot')
var rates = require('../components/rates')
var appBar = require('../components/appBar')

module.exports = function summary (state, emit) {
  return html`
    <body class=${styles.body}>
      ${appBar()}

      <div class='ph4'>
        ${rates(state, emit)}
        ${renderSummary()}
      </div>
    </body>
  `

  function renderSummary () {
    var rows = state.transactions.map(function (tx) {
      tx.currentRate = state.rates[tx.currency] || 0
      return tx
    })

    return pivot({
      data: rows,
      groups: dimensions(),
      reduce: reduce,
      metrics: metrics()
    })
  }
}

function dimensions () {
  return [
    {value: row => 'Total', title: 'Total'},
    {value: row => row.currency.toUpperCase(), title: 'Currency'}
    // {value: row => row.date.slice(0, 7), title: 'Month'}
    // {value: 'date', title: 'Date'}
  ]
}

function reduce (row, memo) {
  var usd = parseFloat(row.usd)
  var amount = parseFloat(row.amount)
  var currentRate = parseFloat(row.currentRate)
  var currentValue = currentRate * amount

  memo.usd = (memo.usd || 0) + usd
  memo.amount = (memo.amount || 0) + amount
  memo.currentValue = (memo.currentValue || 0) + currentValue

  memo.rate = memo.usd / memo.amount
  memo.profit = memo.currentValue - memo.usd
  memo.margin = memo.profit / memo.usd

  return memo
}

function metrics () {
  return [
    {value: 'amount', title: 'Amount', template: formatNumber},
    {value: 'rate', title: 'Rate', template: formatMoney},
    {value: 'usd', title: 'USD', template: formatMoney},
    {value: 'currentValue', title: 'Value', template: formatMoney},
    {value: 'profit', title: 'Profit', template: formatMoney},
    {value: 'margin', title: 'Margin', template: formatPercent}
  ]
}

function formatMoney (v) { return accounting.formatMoney(v) }
function formatNumber (v) { return accounting.formatNumber(v, 2) }
function formatPercent (v) { return accounting.formatNumber(v * 100, 1) + '%' }
