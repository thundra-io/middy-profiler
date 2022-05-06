let beforeInvocationCallback
let afterInvocationCallback

const _registerBeforeInvocationCallback = (cb) => {
    beforeInvocationCallback = cb
}

const _registerAfterInvocationCallback = (cb) => {
    afterInvocationCallback = cb
}

const _beforeInvocation = async (event, context) => {
    if (beforeInvocationCallback) {
        return beforeInvocationCallback(event, context)
    }
}

const _afterInvocation = async (
    event,
    context,
    response,
    error,
    timeout = false
) => {
    if (afterInvocationCallback) {
        return afterInvocationCallback(event, context, response, error, timeout)
    }
}

module.exports = {
    registerBeforeInvocationCallback: _registerBeforeInvocationCallback,
    registerAfterInvocationCallback: _registerAfterInvocationCallback,
    beforeInvocation: _beforeInvocation,
    afterInvocation: _afterInvocation,
}
