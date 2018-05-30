/** @this Vue */
export default function (value) {
  const regex = /^(\d+)\s*(\+|-|\*|\/)\s*(\d+)$/
  const matches = value.match(regex)
  if (!matches) return []
  let [first, operator, second] = matches.slice(1)
  first = parseInt(first, 10)
  second = parseInt(second, 10)
  // Avoid using `eval`
  const expression = `${first} ${operator} ${second}`
  let result = null
  switch (operator) {
    case '+':
      result = first + second
      break
    case '-':
      result = first - second
      break
    case '*':
      result = first * second
      break
    case '/':
      result = first / second
      break
    // no default
  }
  return {
    type: 'clipboard',
    category: 'calculator',
    link: String(result),
    title: `<strong>${result}</strong>`,
    subtitle: expression,
    score: 1,
  }
}
