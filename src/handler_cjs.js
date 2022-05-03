const loader = require('./loader.js')
const { startProfiler } = require('./profiler.js')
const {
    MIDDY_PROFILER_SAMPLING_INTERVAL_ENV_VAR_NAME,
    MIDDY_PROFILER_HANDLER_ENV_VAR_NAME,
    MIDDY_PROFILER_SAMPLING_INTERVAL_DEFAULT_VALUE,
} = require('./constants.js')
const logger = require('./logger.js')

const samplingInterval =
    parseInt(process.env[MIDDY_PROFILER_SAMPLING_INTERVAL_ENV_VAR_NAME]) ||
    MIDDY_PROFILER_SAMPLING_INTERVAL_DEFAULT_VALUE

let profilerPromise = null
let userHandler = null

try {
    profilerPromise = startProfiler(samplingInterval)
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

    // Delegate to user handler
    return userHandler(event, context)
}
