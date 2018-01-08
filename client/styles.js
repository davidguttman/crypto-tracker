var css = require('sheetify')
var fonts = require('google-fonts')

fonts.add({'Open Sans': true})
css('tachyons')

var fontBody = css`body { font-family: 'Open Sans' }`

module.exports = {
  body: `${fontBody} cf pa3 mw9 center`,
  button: `f5 no-underline black bg-animate hover-bg-black hover-white
    inline-flex items-center pa2 ba border-box mr4 pointer`,
  input: 'input-reset ba b--black-20 pa2 mb2 mw4 tc',
  table: 'f6 w-100 mw8 center',
  th: 'fw6 bb b--black-20 tl pb3 pr3 bg-white',
  tbody: 'lh-copy',
  td: 'pv3 pr3 bb b--black-20',
  metric: 'tr code'
}
