/** @this Vue */
export default function (value) {
  const engines = this.settings['suggestions.searchEngines'] || []
  const encoded = encodeURIComponent(value)
  return engines.map(engine => ({
    type: 'hyperlink',
    category: 'search-engine',
    link: engine.url.replace('%W', encoded),
    title: this.i18n('Search by %N: %W#!2')
      .replace('%N', engine.name).replace('%W', value)
  }))
}
