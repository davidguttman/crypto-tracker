var css = require('sheetify')
var choo = require('choo')
var html = require('choo/html')
var fonts = require('google-fonts')
var devtools = require('choo-devtools')

fonts.add({'Open Sans': true})
css('tachyons')

var app = choo()
app.use(devtools())
app.use(countStore)
app.route('/', mainView)
app.mount('body')

var prefix = css`
  body {
    font-family: "Open Sans";
  }
`

function mainView (state, emit) {
  var bodyStyle = 'cf pa3 mw9 center'
  var buttonStyle = 'f5 no-underline black bg-animate hover-bg-black hover-white inline-flex items-center pa2 ba border-box mr4 pointer'

  return html`
    <body class='${prefix} ${bodyStyle}'>
      <div>
        <form class="pa4 black-80">
          Purchased
          ${renderField({key: 'amount', value: state.newTransaction.amount, title: 'Amount'}, onFieldChange)}
          ${renderField({key: 'currency', value: state.newTransaction.currency, title: 'Currency'}, onFieldChange)}
          for
          ${renderField({key: 'usd', value: state.newTransaction.usd, title: 'USD'}, onFieldChange)}
          on
          ${renderField({key: 'date', value: state.newTransaction.date, title: 'Date'}, onFieldChange)}
          <button class=${buttonStyle} onclick=${clickAdd}>Add</button>
        </form>
      </div>

      <div>
        ${state.transactions.map(function (tx) {
          return html`
            <div>
              ${tx.amount} ${tx.currency} purchased for $${tx.usd}
            </div>
          `
        })}
      </div>

    </body>
  `

  function clickAdd (evt) {
    evt.preventDefault()

    emit('addTransaction')
  }

  function onFieldChange (evt) {
    var key = evt.target.name
    var value = evt.target.value
    emit('changeTransaction', {key, value})
  }
}

function countStore (state, emitter) {
  state.newTransaction = {}
  state.transactions = []

  emitter.on('addTransaction', function () {
    var tx = state.newTransaction
    console.log('tx', tx)

    if (!tx.amount || !tx.currency || !tx.usd) return

    state.transactions.push(tx)
    state.newTransaction = {}
    emitter.emit('render')
  })

  emitter.on('changeTransaction', function (change) {
    state.newTransaction[change.key] = change.value
    emitter.emit('render')
  })
}

function renderField ({key, value, title}, onChange) {
  return html`
    <span>
      <input
        name=${key}
        class='input-reset ba b--black-20 pa2 mb2 mw4 tc'
        type='text'
        placeholder=${title || key}
        value=${value || ''}
        onchange=${onChange}/>
    </span>
  `
}