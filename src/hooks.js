let beforeInvocationCallback
let afterInvocationCallback

module.exports.registerBeforeInvocationCallback = function (cb) {
    beforeInvocationCallback = cb
}

module.exports.registerAfterInvocationCallback = function (cb) {
    afterInvocationCallback = cb
}

module.exports.beforeInvocation = async function (event, context) {
    if (beforeInvocationCallback) {
        return beforeInvocationCallback(event, context)
    }
}

module.exports.afterInvocation = async function (
    event,
    context,
    response,
    error
) {
    if (afterInvocationCallback) {
        return afterInvocationCallback(event, context, response, error)
    }
}
