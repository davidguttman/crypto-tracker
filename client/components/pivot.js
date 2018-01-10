var html = require('choo/html')
var dataframe = require('dataframe')

var styles = require('../styles')

module.exports = function (opts) {
  var data = opts.data
  var groups = opts.groups
  var metrics = opts.metrics
  var reduce = opts.reduce
  var style = styles.summary

  var df = dataframe({
    rows: data,
    dimensions: groups,
    reduce: reduce
  })

  var results = df.calculate({
    dimensions: groups.map(g => g.title)
  })

  return html`
    <div>
      <table class=${style.table} cellspacing=0>
        <thead>
          <tr>
            ${groups.map(function (group) {
              return html`
                <th class=${style.th}>${group.title}</th>
              `
            })}

            ${metrics.map(function (metric) {
              return html`
                <th class='${style.th} tr'>${metric.title}</th>
              `
            })}
          </tr>
        </thead>
        
        <tbody class=${style.tbody}>
          ${results.map(function (row) {
            return html`
              <tr>
                ${groups.map(function (group, i) {
                  if (i < row._level) return html`<td />`

                  return html`
                    <td class=${style.td}>
                      ${row[group.title]}
                    </td>
                  `
                })}

                ${metrics.map(function (metric) {
                  return html`
                    <td class='${style.metric}'>
                      ${
                        metric.template
                          ? metric.template(row[metric.value])
                          : row[metric.value]
                      }
                    </td>
                  `
                })}
              </tr>
            `
          })}
        </tbody>
      </table>
    </div>
  `
}
