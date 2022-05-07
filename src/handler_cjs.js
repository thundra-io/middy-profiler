const loader = require('./loader.js')
const { startProfiler } = require('./controller.js')
const { MIDDY_PROFILER_HANDLER_ENV_VAR_NAME } = require('./constants.js')
const { beforeInvocation, afterInvocation } = require('./hooks.js')
const logger = require('./logger.js')

let profilerPromise = null
let userHandler = null

try {
    profilerPromise = startProfiler()
} catch (e) {
    logger.error('Unable to start profiler:', e)
}

async function ensureInitialized() {
    // Wait profiler start task if it is in progress
    if (!profilerPromise) {
        try {
            await profilerPromise
        } catch (e) {
            logger.error('Unable to start profiler:', e)
        } finally {
            // Clear promise, so it will not be checked again in all cases
            profilerPromise = null
        }
    }
    // Load user handler if it is not loaded yet
    if (!userHandler) {
        userHandler = loader.loadHandler(
            process.env.LAMBDA_TASK_ROOT,
            process.env[MIDDY_PROFILER_HANDLER_ENV_VAR_NAME]
        )
    }
}

// Export wrapper handler
module.exports.wrapper = async function (event, context) {
    // Ensure initialization is completed
    await ensureInitialized()

    await beforeInvocation(event, context)
    try {
        // Delegate to user handler
        const responsePromise = userHandler(event, context)
        const response = await responsePromise
        await afterInvocation(event, context, response, null)
        return response
    } catch (error) {
        await afterInvocation(event, context, null, error)
        throw error
    }
}
