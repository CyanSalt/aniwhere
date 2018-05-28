const {readdir, lstat} = require('original-fs')
const {promisify} = require('util')
const {join, basename} = require('path')
const plstat = promisify(lstat)

const history = {
  resolved: {},
  cachedAt: null,
  prepare({start}) {
    if (this.cachedAt !== start) {
      this.resolved = {}
    }
    this.cachedAt = start
  },
  hit(path) {
    if (this.resolved[path]) {
      return true
    }
    this.resolved[path] = true
    return false
  }
}

function searchFilesIn(args, context, callback) {
  const {path, exts} = args
  readdir(path, (readdirerr, files) => {
    if (readdirerr) return
    for (const file of files) {
      const fullpath = join(path, file)
      if (history.hit(fullpath)) return
      lstat(fullpath, (lstaterr, stats) => {
        if (lstaterr) return
        if (stats.isDirectory()) {
          searchFilesIn({path: fullpath, exts}, context, callback)
          if (exts.indexOf('/') !== -1) {
            const info = {
              name: file,
              basename: file,
              path: fullpath,
            }
            callback({info, context})
          }
          return
        }
        const ext = exts.find(extname => {
          return file.slice(-extname.length) === extname
        })
        if (!ext) return
        const info = {
          name: file,
          basename: basename(file, ext),
          path: fullpath,
          icon: fullpath,
        }
        if (ext === '.lnk' && process.platform === 'win32') {
          info.shortcut = 1
          if (exts.indexOf('/') !== -1) {
            info.shortcut = 2
          }
        }
        callback({info, context})
      })
    }
  })
}

function resolveShortcut(args, context, callback) {
  const {info, details} = args
  const {shortcut} = info
  info.shortcut = false
  info.path = details.target
  if (history.hit(info.path)) return
  let condition = null
  if (shortcut === 2) {
    condition = Promise.resolve()
  } else {
    condition = plstat(details.target).then(lstats => {
      if (lstats.isDirectory()) {
        throw new Error('is directory')
      }
      return lstats
    })
  }
  condition.then(() => {
    info.icon = details.icon
    info.description = details.description
    if (details.args) {
      info.args = details.args.trim().split(/\s+/)
    }
  }).catch(e => {}).then(() => {
    callback({info, context})
  })
}

onmessage = ({data}) => {
  const [action, args, context] = data
  history.prepare(context)
  switch (action) {
    case 'search': {
      searchFilesIn(args, context, postMessage)
      break
    }
    case 'shortcut': {
      resolveShortcut(args, context, postMessage)
      break
    }
    default:
      throw new Error('Unsupported action.')
  }
}
