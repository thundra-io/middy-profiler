const path = require('path')
const fs = require('fs')

class InvalidModule extends Error {}
class InvalidHandler extends Error {}
class BadHandlerFormat extends Error {}
class UserCodeError extends Error {}

const FUNCTION_PATTERN = /^([^.]*)\.(.*)$/
const UPPER_FOLDER_SUBSTRING = '..'

module.exports.loadHandler = function (appPath, handlerString) {
    if (handlerString.includes(UPPER_FOLDER_SUBSTRING)) {
        throw new BadHandlerFormat(
            `'${handlerString}' is not a valid handler name. Try to use absolute paths.`
        )
    }

    const moduleAndHandler = path.basename(handlerString)
    const modulePath = handlerString.substring(
        0,
        handlerString.indexOf(moduleAndHandler)
    )

    const match = moduleAndHandler.match(FUNCTION_PATTERN)
    if (!match || match.length !== 3) {
        throw new BadHandlerFormat('Bad handler')
    }

    const handlerPath = match[2]
    let module = match[1]
    if (
        process.version.startsWith('v12.') ||
        process.version.startsWith('v14.')
    ) {
        if (module && !(module.startsWith('./') || module.startsWith('../'))) {
            module = './' + module
        }
    }

    let userModule
    let handlerFunc

    try {
        const lambdaStylePath = path.resolve(appPath, modulePath, module)
        if (fs.existsSync(modulePath) || fs.existsSync(modulePath + '.js')) {
            userModule = require(lambdaStylePath)
        } else {
            const nodeStylePath = require.resolve(module, {
                paths: [appPath, modulePath],
            })
            userModule = require(nodeStylePath)
        }
    } catch (e) {
        if (e instanceof SyntaxError) {
            throw new UserCodeError(e.toString())
        } else if (e.code !== undefined && e.code === 'MODULE_NOT_FOUND') {
            try {
                // Add relative path prefix to try resolve again for nodejs12.x
                // https://github.com/nodejs/node/issues/27583
                const nodeStylePath = require.resolve('./' + module, {
                    paths: [appPath, modulePath],
                })
                userModule = require(nodeStylePath)
            } catch (err) {
                throw new InvalidModule(e.toString())
            }
        } else {
            throw e
        }
    }

    handlerFunc = handlerPath.split('.').reduce((nested, key) => {
        return nested && nested[key]
    }, userModule)

    if (!handlerFunc) {
        throw new InvalidHandler(
            `Couldn't find ${handlerString}, it might be undefined or not exported`
        )
    }

    if (typeof handlerFunc !== 'function') {
        throw new InvalidHandler(`Type of ${handlerString} is not a function`)
    }

    return handlerFunc
}
