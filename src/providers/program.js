/** @this Vue */
export default function (value) {
  const paths = this.settings['suggestions.programPaths'] || []
  const exts = this.settings['suggestions.programExts'] || []
  return this.queryFiles(value, 'program', paths, exts)
}
