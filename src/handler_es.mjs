import loader from './loader.js'
import { startProfiler } from './profiler.js'
import {
    MIDDY_PROFILER_SAMPLING_INTERVAL_ENV_VAR_NAME,
    MIDDY_PROFILER_HANDLER_ENV_VAR_NAME,
    MIDDY_PROFILER_SAMPLING_INTERVAL_DEFAULT_VALUE,
} from './constants.js'
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
    // Delegate to user handler
    return userHandler(event, context)
}
