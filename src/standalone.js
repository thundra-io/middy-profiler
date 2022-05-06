const {
    MIDDY_PROFILER_ENABLE_ENV_VAR_NAME,
    MIDDY_PROFILER_SAMPLING_INTERVAL_ENV_VAR_NAME,
    MIDDY_PROFILER_S3_BUCKET_NAME_ENV_VAR_NAME,
    MIDDY_PROFILER_S3_PATH_PREFIX_ENV_VAR_NAME,
    MIDDY_PROFILER_S3_FILE_NAME_ENV_VAR_NAME,
    MIDDY_PROFILER_SAMPLING_INTERVAL_DEFAULT_VALUE,
    MIDDY_PROFILER_S3_FILE_NAME_DEFAULT_VALUE,
} = require('./constants')

const enable =
    (process.env[MIDDY_PROFILER_ENABLE_ENV_VAR_NAME] || 'true') === 'true'
if (!enable) {
    return
}

const {
    registerBeforeInvocationCallback,
    registerAfterInvocationCallback,
} = require('./hooks.js')
const {
    startProfiler,
    finishProfiler,
    isProfilerStarted,
} = require('./profiler')
const { reportToS3 } = require('./reporter')

const logger = require('./logger')

const samplingInterval =
    parseInt(process.env[MIDDY_PROFILER_SAMPLING_INTERVAL_ENV_VAR_NAME]) ||
    MIDDY_PROFILER_SAMPLING_INTERVAL_DEFAULT_VALUE
const bucketName = process.env[MIDDY_PROFILER_S3_BUCKET_NAME_ENV_VAR_NAME]
const pathPrefix = process.env[MIDDY_PROFILER_S3_PATH_PREFIX_ENV_VAR_NAME] || ''
const fileName =
    process.env[MIDDY_PROFILER_S3_FILE_NAME_ENV_VAR_NAME] ||
    MIDDY_PROFILER_S3_FILE_NAME_DEFAULT_VALUE

async function beforeInvocation(event, context) {
    if (!bucketName) {
        return
    }
    try {
        if (!isProfilerStarted()) {
            await startProfiler(samplingInterval)
        }
    } catch (e) {
        logger.error('Unable to start profiler:', e)
    }
}

async function afterInvocation(event, context, response, error) {
    if (!isProfilerStarted()) {
        return
    }

    try {
        const profilingData = await finishProfiler()
        await reportToS3(
            profilingData,
            bucketName,
            pathPrefix,
            fileName,
            context.functionName,
            context.awsRequestId
        )
    } catch (e) {
        logger.error('Unable to finish profiler:', e)
    }
}

registerBeforeInvocationCallback(beforeInvocation)
registerAfterInvocationCallback(afterInvocation)

require('./bootstrap')
