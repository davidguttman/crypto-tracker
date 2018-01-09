var css = require('sheetify')

css('tachyons')

module.exports = {
  body: 'sans-serif tc',
  button: `f5 no-underline black bg-animate hover-bg-black hover-white
    inline-flex items-center pa2 ba border-box mr4 pointer`,
  input: 'input-reset ba b--black-20 pa2 mb2 mw4 tc',
  summary: {
    table: 'f6 w-100 mw8 center',
    th: 'fw6 bb b--black-20 tl pb3 pr3 bg-white',
    tbody: 'lh-copy',
    td: 'pv3 pr3 bb b--black-20 tl',
    metric: 'pv3 pr3 bb b--black-20 tr code'
  },
  appBar: {
    header: 'bg-black-80 ph3 pv3 pv4-ns ph4-m ph5-l mb4',
    nav: 'dt w-100 f6 tracked',
    logo: 'dtc v-mid w-25 tl white dib mr3 fw1 ttu',
    links: 'dtc v-mid w-75 tr',
    link: 'link dim white dib mr3',
    linkLast: 'link dim white dib'
  }
}
