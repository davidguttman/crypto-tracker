module.exports = function (content, filename, mime) {
  var blob = new window.Blob([content], { type: mime })
  console.log('blob', blob)

  var a = document.createElement('a')
  a.download = filename
  a.href = window.URL.createObjectURL(blob)
  a.dataset.downloadurl = [mime, a.download, a.href].join(':')

  var e = document.createEvent('MouseEvents')
  e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false,
    false, false, 0, null)
  return a.dispatchEvent(e)
}
