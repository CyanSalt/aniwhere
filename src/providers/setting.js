import settings from '../assets/settings-ui.json'
const entries = Object.entries(settings)
const {hasOwnProperty} = Object.prototype

/** @this Vue */
export default function (value) {
  value = value.trim()
  const pattern = /^:(set|select)\b(.*)$/i
  const matches = value.match(pattern)
  if (!matches) return []
  let [keyword, query] = matches.slice(1)
  query = query.trim()
  if (keyword === 'select' &&
    hasOwnProperty.call(settings, query) &&
    settings[query].type === 'select'
  ) {
    return settings[query].options.map(option => ({
      type: 'setting',
      category: 'setting',
      link: query,
      title: this.i18n('Option: %T#!4').replace('%T', this.i18n(option.title)),
      value: option.value,
      key: `${query}[${option.value}]`
    }))
  }
  query = query.toLowerCase()
  return entries.filter(([key, entry]) => entry.support !== false &&
    key.toLowerCase().indexOf(query) !== -1)
    .map(([key, info]) => ({
      type: 'setting',
      category: 'setting',
      link: key,
      title: this.i18n('Setting: %T#!3').replace('%T', this.i18n(info.title)),
      value: null
    }))
}
