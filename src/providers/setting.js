import settings from '../assets/settings-ui.json'
const entries = Object.entries(settings)
const {hasOwnProperty} = Object.prototype

function stringify(value, i18n) {
  if (typeof value === 'boolean') {
    return value ? i18n('Yes#!19') : i18n('No#!20')
  }
  return value
}

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
      subtitle: option.default ? this.i18n('Default#!17') : null,
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
      subtitle: info.default ? this.i18n('Default: %V#!18')
        .replace('%V', stringify(info.default, this.i18n)) : null,
      value: null
    }))
}
