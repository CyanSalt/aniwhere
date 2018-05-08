/** @this Vue */
export default function (value) {
  const paths = this.settings['suggestions.documentPaths']
  const exts = this.settings['suggestions.documentExts']
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
