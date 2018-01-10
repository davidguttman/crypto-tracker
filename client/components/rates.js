var html = require('choo/html')
var jsonist = require('jsonist')
var accounting = require('accounting')

var field = require('./field')
var styles = require('../styles')

module.exports = function rates (state, emit) {
  return html`
    <div class='mb4'>
      BTC:
      ${field({
        key: 'btc',
        value: accounting.formatMoney(state.rates.btc),
        title: 'BTC'
      }, onRateChange)}

      BCH:
      ${field({
        key: 'bch',
        value: accounting.formatMoney(state.rates.bch),
        title: 'BCH'
      }, onRateChange)}

      ETH:
      ${field({
        key: 'eth',
        value: accounting.formatMoney(state.rates.eth),
        title: 'ETH'
      }, onRateChange)}

      LTC:
      ${field({
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
