const internal = [
  {
    input: 'i love you',
    output: {
      title: '<strong>I love you, too ❤️</strong>',
    }
  }
]

/** @this Vue */
export default function (value) {
  const snippets = this.settings['suggestions.snippets']
  const result = []
  for (const snippet of snippets.concat(internal)) {
    let matched = false
    if (snippet.rule) {
      matched = new RegExp(snippet.rule).test(value)
    } else if (snippet.input) {
      matched = snippet.input.toLowerCase() === value.toLowerCase()
    }
    if (matched && snippet.output) {
      result.push(snippet.output)
    }
  }
  return result
}
