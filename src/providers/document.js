/** @this Vue */
export default function (value) {
  const paths = this.settings['suggestions.files.documentPaths']
  const exts = this.settings['suggestions.files.documentExts']
  const mapper = file => ({
    type: 'file',
    category: 'document',
    link: file.path,
    title: file.name,
    subtitle: file.path,
    icon: file.icon,
    highlight: true,
  })
  return this.queryFiles(value, {paths, exts, mapper})
}
