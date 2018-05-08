/** @this Vue */
export default function (value) {
  const paths = this.settings['suggestions.programPaths'] || []
  const exts = this.settings['suggestions.programExts'] || []
  return this.queryFiles(value, {paths, exts}, file => ({
    type: 'file',
    category: 'program',
    link: file.path,
    text: file.basename,
  }))
}
