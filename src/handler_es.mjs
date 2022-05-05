import loader from './loader.js'
import { startProfiler } from './profiler.js'
import {
    MIDDY_PROFILER_SAMPLING_INTERVAL_ENV_VAR_NAME,
    MIDDY_PROFILER_HANDLER_ENV_VAR_NAME,
    MIDDY_PROFILER_SAMPLING_INTERVAL_DEFAULT_VALUE,
} from './constants.js'
import { beforeInvocation, afterInvocation } from './hooks.js'
import logger from './logger.js'

const samplingInterval =
    parseInt(process.env[MIDDY_PROFILER_SAMPLING_INTERVAL_ENV_VAR_NAME]) ||
    MIDDY_PROFILER_SAMPLING_INTERVAL_DEFAULT_VALUE

try {
    // Start profiler and wait for it
    await startProfiler(samplingInterval)
} catch (e) {
    logger.error('Unable to start profiler:', e)
}

// Load user handler
const userHandler =
    loader.loadHandler(
        process.env.LAMBDA_TASK_ROOT,
        process.env[MIDDY_PROFILER_HANDLER_ENV_VAR_NAME])

// Export wrapper handler
export async function wrapper(event, context) {
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
