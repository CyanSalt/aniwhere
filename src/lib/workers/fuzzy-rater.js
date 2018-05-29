const fuzzysort = require('fuzzysort')
const pinyin = require('./pinyin')

const langs = [
  {
    // Chinese
    regex: /[\u4e00-\u9FA5]/g,
    mapper: char => {
      const letters = pinyin(char)
      if (!letters) return null
      return letters.charAt(0).toUpperCase() + letters.slice(1)
    }
  }
]

function LanguageMap() {
  this.dictionary = []
}

LanguageMap.prototype = {
  name: 'LanguageMap',
  empty() {
    return this.dictionary.length === 0
  },
  record(index, diff) {
    const offset = this.dictionary.length ?
      this.dictionary[this.dictionary.length - 1].offset : 0
    this.dictionary.push({
      index,
      range: [index + offset, index + offset + diff],
      offset: offset + diff
    })
  },
  revise(indexes) {
    if (!this.dictionary.length) return indexes
    return indexes.reduce((all, hit) => {
      let distance = 0
      for (const info of this.dictionary) {
        const {index, range, offset} = info
        const [start, end] = range
        if (hit > end) {
          distance = offset
        } else {
          if (hit < start) {
            all.push(hit - distance)
          } else if (all.indexOf(index) === -1) {
            all.push(index)
          }
          return all
        }
      }
      all.push(hit - distance)
      return all
    }, [])
  },
}

function matchFileEntry({entry, value}, context, callback) {
  let haystack = entry.original.name
  // Translate languages
  const langmap = new LanguageMap()
  for (const {regex, mapper} of langs) {
    if (!regex.test(value) && regex.test(haystack)) {
      haystack = haystack.replace(regex, (original, index) => {
        const target = mapper(original)
        if (!target) return original
        langmap.record(index, target.length - 1)
        return target
      })
    }
  }
  const result = fuzzysort.single(value, haystack)
  if (result) {
    entry.score = result.score
    if (entry.highlight) {
      const indexes = langmap.revise(result.indexes)
      const pseudo = {target: entry.title, indexes}
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
