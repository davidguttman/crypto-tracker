var html = require('choo/html')
var jsonist = require('jsonist')
var dataframe = require('dataframe')
var accounting = require('accounting')

var styles = require('../styles')
var appBar = require('../components/appBar')

module.exports = function summary (state, emit) {
  return html`
    <body class=${styles.body}>
      ${appBar()}

      <div class='ph4'>
        ${renderRates()}
        ${renderSummary()}
      </div>
    </body>
  `

  function renderRates () {
    return html`
      <div class='mb4'>
        BTC:
        ${renderField({
          key: 'btc',
          value: accounting.formatMoney(state.rates.btc),
          title: 'BTC'
        }, onRateChange)}

        BCH:
        ${renderField({
          key: 'bch',
          value: accounting.formatMoney(state.rates.bch),
          title: 'BCH'
        }, onRateChange)}

        ETH:
        ${renderField({
          key: 'eth',
          value: accounting.formatMoney(state.rates.eth),
          title: 'ETH'
        }, onRateChange)}

        LTC:
        ${renderField({
          key: 'ltc',
          value: accounting.formatMoney(state.rates.ltc),
          title: 'LTC'
        }, onRateChange)}

        <button
          class=${styles.button}
          onclick=${clickUpdateRates}>
          Update Rates
        </button>
      </div>
    `
  }

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

  function onRateChange (evt) {
    var key = evt.target.name
    var value = accounting.unformat(evt.target.value)
    emit('changeRate', {key, value})
  }

  function clickUpdateRates () {
    var url = 'https://api.coinbase.com/v2/prices/USD/spot?'
    jsonist.get(url, {headers: {'cb-version': '2017-08-07'}}, function (err, res) {
      if (err) return console.error(err)
      res.data.forEach(function (rate) {
        var key = rate.base.toLowerCase()
        var value = rate.amount
        emit('changeRate', {key, value})
      })
    })
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
