var cuid = require('cuid')
var choo = require('choo')
var html = require('choo/html')
var persist = require('choo-persist')
var devtools = require('choo-devtools')

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
      ${renderNewTransaction()}
      ${renderTransactionList()}
      ${renderControls()}
    </body>
  `

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
    return html`
      <div>
        ${state.transactions.map(function (tx) {
          return html`
            <div title=${tx.id}>
              ${tx.amount} ${tx.currency} purchased for $${tx.usd} on ${tx.date}
            </div>
          `
        })}
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

function countStore (state, emitter) {
  state.newTransaction = state.newTransaction || {}
  state.transactions = state.transactions || []

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
