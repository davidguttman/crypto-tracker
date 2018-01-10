var html = require('choo/html')
var dataframe = require('dataframe')
var accounting = require('accounting')

var styles = require('../styles')
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
    var style = styles.summary

    var dimensions = [
      {value: row => 'Total', title: 'Total'},
      {value: 'currency', title: 'Currency'},
      {value: 'date', title: 'Date'}
    ]

    var reduce = function (row, memo) {
      var rateNow = parseFloat(state.rates[row.currency] || 0)

      var usd = parseFloat(row.usd)
      var amount = parseFloat(row.amount)
      var currentValue = rateNow * amount

      memo.usd = (memo.usd || 0) + usd
      memo.amount = (memo.amount || 0) + amount
      memo.currentValue = (memo.currentValue || 0) + currentValue

      memo.rate = memo.usd / memo.amount
      memo.profit = memo.currentValue - memo.usd
      memo.margin = memo.profit / memo.usd

      return memo
    }

    var df = dataframe({
      rows: state.transactions,
      dimensions: dimensions,
      reduce: reduce
    })

    var results = df.calculate({
      dimensions: ['Total', 'Currency']
    })

    return html`
      <div>
        <table class=${style.table} cellspacing=0>
          <thead>
            <tr>
              <th class=${style.th}>Currency</th>

              <th class='${style.th} tr'>Amount</th>
              <th class='${style.th} tr'>Rate</th>
              <th class='${style.th} tr'>USD</th>
              <th class='${style.th} tr'>Value</th>
              <th class='${style.th} tr'>Profit</th>
              <th class='${style.th} tr'>Margin</th>
            </tr>
          </thead>
          <tbody class=${style.tbody}>
            ${results.map(function (row) {
              return html`
                <tr>
                  <td class=${style.td}>${(row.Currency || '').toUpperCase()}</td>

                  <td class='${style.metric}'>${row.Currency && accounting.formatNumber(row.amount, 4)}</td>
                  <td class='${style.metric}'>${row.Currency && accounting.formatMoney(row.rate)}</td>
                  <td class='${style.metric}'>${accounting.formatMoney(row.usd)}</td>
                  <td class='${style.metric}'>${accounting.formatMoney(row.currentValue)}</td>
                  <td class='${style.metric}'>${accounting.formatMoney(row.profit)}</td>
                  <td class='${style.metric}'>${accounting.formatNumber(row.margin * 100, 1)}%</td>
                </tr>
              `
            })}
          </tbody>
        </table>
      </div>
    `
  }
}
