function format(date) {
  return date.toString().replace(/\s+GMT(?:.)*$/, '')
}

/** @this Vue */
export default function (value) {
  const regex = /^\s*(?:([\d\-/.:TZ]+)\s+)?(\+|-)\s*(\d+)\s*(y|m|d|h)\s*$/i
  const matches = value.match(regex)
  if (!matches) return []
  let [from, operator, distance, unit] = matches.slice(1)
  from = from ? new Date(from) : new Date()
  distance = parseInt(distance, 10)
  distance *= operator === '+' ? 1 : -1
  unit = unit.toLowerCase()
  const expression = `${format(from)} ${operator} ${distance}${unit}`
  let target = from
  switch (unit) {
    case 'y':
      target.setFullYear(target.getFullYear() + distance)
      break
    case 'm': {
      let months = target.getMonth() + distance
      if (months < 0 || months >= 12) {
        const years = Math.floor(months / 12)
        months -= 12 * years
        target.setFullYear(target.getFullYear() + years)
      }
      target.setMonth(months)
      break
    }
    case 'd':
      target = new Date(target.getTime() + (864e5 * distance))
      break
    case 'h':
      target = new Date(target.getTime() + (36e4 * distance))
      break
    // no default
  }
  const result = format(target)
  return {
    type: 'clipboard',
    category: 'calendar',
    link: result,
    title: `<strong>${result}</strong>`,
    subtitle: expression,
    score: 1,
  }
}