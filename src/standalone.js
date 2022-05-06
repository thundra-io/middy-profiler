const { MIDDY_PROFILER_ENABLE_ENV_VAR_NAME } = require('./constants')
const enable =
    (process.env[MIDDY_PROFILER_ENABLE_ENV_VAR_NAME] || 'true') === 'true'
if (!enable) {
    return
}

const {
    registerBeforeInvocationCallback,
    registerAfterInvocationCallback,
} = require('./hooks.js')
const controller = require('./controller')

async function beforeInvocation(event, context) {
    return controller.beforeInvocation(null, event, context)
}

async function afterInvocation(event, context, response, error) {
    return controller.afterInvocation(
        null,
        event,
        context,
        response,
        error,
        false
    )
}

registerBeforeInvocationCallback(beforeInvocation)
registerAfterInvocationCallback(afterInvocation)

require('./bootstrap')
