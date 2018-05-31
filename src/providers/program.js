/** @this Vue */
export default function (value) {
  const paths = this.settings['suggestions.files.programPaths']
    .map(this.interpretPath)
  const exts = this.settings['suggestions.files.programExts']
  const mapper = file => ({
    type: 'file',
    category: 'program',
    link: file.path,
    title: file.basename,
    subtitle: file.description || file.path,
    args: file.args,
    icon: file.icon || file.path,
    highlight: true,
  })
  return this.queryFiles(value, {paths, exts, mapper, by: 'basename'})
}
