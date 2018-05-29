const fuzzysort = require('fuzzysort')
const pinyin = require('./pinyin')

function ucfirstPinyin(char) {
  const letters = pinyin(char)
  return letters.charAt(0).toUpperCase() + letters.slice(1)
}

function matchFileEntry({entry, value}, context, callback) {
  let haystack = entry.original.name
  // Chinese pinyin search
  const chinese = /[\u4e00-\u9FA5]/g
  let transformed = false
  if (!chinese.test(value) && chinese.test(haystack)) {
    haystack = haystack.replace(chinese, ucfirstPinyin)
    transformed = true
  }
  const result = fuzzysort.single(value, haystack)
  if (result) {
    entry.score = result.score
    if (entry.highlight && !transformed) {
      const pseudo = {target: entry.title, indexes: result.indexes}
      entry.title = fuzzysort.highlight(pseudo, '<strong>', '</strong>')
    }
  } else {
    entry.score = false
  }
  callback({entry, context})
}

onmessage = ({data}) => {
  const [args, context] = data
  matchFileEntry(args, context, postMessage)
}
