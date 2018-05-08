/** @this Vue */
export default function (value) {
  const paths = this.settings['suggestions.documentPaths'] || []
  const exts = this.settings['suggestions.documentExts'] || []
  return this.queryFiles(value, 'document', paths, exts)
}
