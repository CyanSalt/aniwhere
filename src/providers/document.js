/** @this Vue */
export default function (value) {
  const paths = this.settings['suggestions.documentPaths'] || []
  const exts = this.settings['suggestions.documentExts'] || []
  return this.queryFiles(value, {paths, exts}, file => ({
    type: 'file',
    category: 'document',
    link: file.path,
    title: file.name,
    subtitle: file.path,
    icon: file.icon,
  }))
}
