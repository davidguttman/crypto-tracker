var cuid = require('cuid')
var choo = require('choo')
var html = require('choo/html')
var persist = require('choo-persist')
var devtools = require('choo-devtools')
var dataframe = require('dataframe')
var accounting = require('accounting')

var styles = require('./styles')
var download = require('./download')

var app = choo()
app.use(devtools())
app.use(persist())
app.use(countStore)
app.route('/', mainView)
app.mount('body')

function mainView (state, emit) {
  return html`
    <body class=${styles.body}>
      ${renderRates()}
      ${renderNewTransaction()}
      ${renderTransactionList()}
      ${renderControls()}
    </body>
  `

  function renderRates () {
    return html`
      <div>
        ${renderField({
          key: 'btc',
          value: state.rates.btc,
          title: 'BTC'
        }, onRateChange)}
        ${renderField({
          key: 'bch',
          value: state.rates.bch,
          title: 'BCH'
        }, onRateChange)}
        ${renderField({
          key: 'eth',
          value: state.rates.eth,
          title: 'ETH'
        }, onRateChange)}
        ${renderField({
          key: 'ltc',
          value: state.rates.ltc,
          title: 'LTC'
        }, onRateChange)}
      </div>
    `
  }

  function renderNewTransaction () {
    return html`
      <div>
        <form class="pa4 black-80">
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
    var dimensions = [
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
      dimensions: ['Currency']
    })

    return html`
      <div>
        <table class=${styles.table} cellspacing=0>
          <thead>
            <tr>
              <th class=${styles.th}>Currency</th>

              <th class='${styles.th} tr'>Amount</th>
              <th class='${styles.th} tr'>USD</th>
              <th class='${styles.th} tr'>Rate</th>
              <th class='${styles.th} tr'>Value</th>
              <th class='${styles.th} tr'>Profit</th>
              <th class='${styles.th} tr'>Margin</th>
            </tr>
          </thead>
          <tbody class=${styles.tbody}>
            ${results.map(function (row) {
              return html`
                <tr>
                  <td class=${styles.td}>${row.Currency.toUpperCase()}</td>

                  <td class='${styles.td} tr'>${accounting.formatNumber(row.amount, 4)}</td>
                  <td class='${styles.td} tr'>${accounting.formatMoney(row.usd)}</td>
                  <td class='${styles.td} tr'>${accounting.formatMoney(row.rate)}</td>
                  <td class='${styles.td} tr'>${accounting.formatMoney(row.currentValue)}</td>
                  <td class='${styles.td} tr'>${accounting.formatMoney(row.profit)}</td>
                  <td class='${styles.td} tr'>${accounting.formatNumber(row.margin * 100, 1)}%</td>
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

  function onRateChange (evt) {
    var key = evt.target.name
    var value = evt.target.value
    emit('changeRate', {key, value})
  }
}

function countStore (state, emitter) {
  state.rates = state.rates || {}
  state.newTransaction = state.newTransaction || {}
  state.transactions = state.transactions || []

  emitter.on('changeRate', function ({key, value}) {
    state.rates[key] = value
    emitter.emit('render')
  })

  emitter.on('addTransaction', function () {
    var tx = state.newTransaction

    if (!tx.amount || !tx.currency || !tx.usd) return

    tx.id = cuid()
    state.transactions.push(tx)
    state.newTransaction = {}
    emitter.emit('render')
  })

  emitter.on('changeTransaction', function (change) {
    state.newTransaction[change.key] = change.value
    emitter.emit('render')
  })

  emitter.on('exportTransactions', function () {
    var content = JSON.stringify(state.transactions)
    download(content, 'transactions.json', 'application/json')
  })
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
