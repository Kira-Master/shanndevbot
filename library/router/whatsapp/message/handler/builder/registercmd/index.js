const path = require('path')
const { watchFile } = require('fs')
const { GlobSync } = require('glob')
const { commands, listCommands } = require('@router/builder/cmd')

class Utility {
    constructor() { Promise.all([this.registerCommand()]) }

    getAllFiles(directory) {
        const pathFiles = new GlobSync(path.join(directory, '**', '*.js').replace(/\\/g, '/')).found
        const files = []

        for (let file of pathFiles) {
            const basename = path.parse(file).name.toLowerCase()
            files.push({ basename, file, })
        }

        return files
    }

    registerCommand() {
        const files = this.getAllFiles(path.join(__dirname, '..', '..', '..', '..', 'cmd'))
        for (let { basename, file } of files) {
            if (commands.get(basename)) {
                continue
            } else if (!require(file).callback) {
                continue
            } else {
                commands.set(basename, require(file))
                watchFile(file, () => {
                    const dir = path.resolve(file)
                    if (dir in require.cache) {
                        delete require.cache[dir]
                        commands.set(basename, require(file))
                        console.log(`[ ! ] reloaded ${basename}`)
                    }
                })
            }
        }

        for (let x of commands.keys()) {
            let command = commands.get(x)
            let category = command?.category

            if (!category) {
                continue
            }

            if (!listCommands[category]) {
                listCommands[category] = []
            }

            !listCommands[category].includes(x) && listCommands[category].push(x)
        }

        console.log(`[ ! ] Loaded commands ${commands.size} of ${files.length}`)
    }
}

module.exports = { Utility }