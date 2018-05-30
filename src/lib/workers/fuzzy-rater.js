const fuzzaldrin = require('fuzzaldrin-plus')
const pinyin = require('./pinyin')

const langs = [
  {
    // Chinese
    regex: /[\u4e00-\u9FA5]/g,
    mapper: pinyin,
  }
]

class LanguageMap {
  constructor() {
    this.dictionary = []
  }
  empty() {
    return this.dictionary.length === 0
  }
  record(index, diff) {
    const offset = this.dictionary.length ?
      this.dictionary[this.dictionary.length - 1].offset : 0
    this.dictionary.push({
      index,
      range: [index + offset, index + offset + diff],
      offset: offset + diff
    })
  }
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
  }
}

function highlight(target, indexes) {
  let previous = -2
  const chars = target.split('')
  for (const current of indexes) {
    if (current >= chars.length) break
    if (previous !== current - 1) {
      if (previous >= 0) {
        chars[previous] = `${chars[previous]}</strong>`
      }
      chars[current] = `<strong>${chars[current]}`
    }
    previous = current
  }
  chars[previous] = `${chars[previous]}</strong>`
  return chars.join('')
}

function matchFileEntry({entry, value, threshold}, context, callback) {
  let haystack = entry.original.name
  // Translate languages
  const langmap = new LanguageMap()
  for (const {regex, mapper} of langs) {
    if (!regex.test(value) && regex.test(haystack)) {
      haystack = haystack.replace(regex, (original, index) => {
        let target = mapper(original)
        if (!target) return original
        target = target.charAt(0).toUpperCase() + target.slice(1)
        langmap.record(index, target.length - 1)
        return target
      })
    }
  }
  const score = fuzzaldrin.score(haystack, value)
  if (score < threshold) return
  entry.score = score
  if (entry.highlight) {
    const indexes = fuzzaldrin.match(haystack, value)
    entry.title = highlight(entry.title, langmap.revise(indexes))
  }
  callback({entry, context})
}

onmessage = ({data}) => {
  const [args, context] = data
  matchFileEntry(args, context, postMessage)
}
