/** @this Vue */
export default function (value) {
  const regex = /^\s*(\d+)\s*(\+|-|\*|\/)\s*(\d+)\s*$/
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
    default: break
  }
  return {
    type: 'clipboard',
    category: 'calculator',
    link: expression,
    text: result,
  }
}
