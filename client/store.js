var cuid = require('cuid')
var download = require('./download')

module.exports = function store (state, emitter) {
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
