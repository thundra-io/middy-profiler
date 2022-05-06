const {
    MIDDY_PROFILER_SAMPLING_INTERVAL_ENV_VAR_NAME,
    MIDDY_PROFILER_S3_BUCKET_NAME_ENV_VAR_NAME,
    MIDDY_PROFILER_S3_PATH_PREFIX_ENV_VAR_NAME,
    MIDDY_PROFILER_S3_FILE_NAME_ENV_VAR_NAME,
    MIDDY_PROFILER_TIMEOUT_MARGIN_ENV_VAR_NAME,
    MIDDY_PROFILER_SAMPLING_INTERVAL_DEFAULT_VALUE,
    MIDDY_PROFILER_S3_FILE_NAME_DEFAULT_VALUE,
    MIDDY_PROFILER_TIMEOUT_MARGIN_DEFAULT_VALUE,
} = require('./constants')
const {
    startProfiler,
    finishProfiler,
    isProfilerStarted,
} = require('./profiler')
const { reportToS3 } = require('./reporter')
const logger = require('./logger')

const samplingInterval = parseInt(
    process.env[MIDDY_PROFILER_SAMPLING_INTERVAL_ENV_VAR_NAME]
)
const bucketName = process.env[MIDDY_PROFILER_S3_BUCKET_NAME_ENV_VAR_NAME]
const pathPrefix = process.env[MIDDY_PROFILER_S3_PATH_PREFIX_ENV_VAR_NAME]
const fileName = process.env[MIDDY_PROFILER_S3_FILE_NAME_ENV_VAR_NAME]
const timeoutMargin = process.env[MIDDY_PROFILER_TIMEOUT_MARGIN_ENV_VAR_NAME]

let timeoutHandler

const _setupTimeoutHandler = (opts, event, context) => {
    const _timeoutMargin =
        timeoutMargin ||
        (opts && opts.timeoutMargin) ||
        MIDDY_PROFILER_TIMEOUT_MARGIN_DEFAULT_VALUE
    timeoutHandler = setTimeout(async () => {
        logger.warn(
            'About timeout! Reporting collected profiling data so far ...'
        )
        await _afterInvocation(opts, event, context, null, null, true)
    }, context.getRemainingTimeInMillis() - _timeoutMargin)
    timeoutHandler.unref()
}

const _destroyTimeoutHandler = () => {
    if (timeoutHandler) {
        clearTimeout(timeoutHandler)
        timeoutHandler = null
    }
}

const _beforeInvocation = async (opts, event, context) => {
    _destroyTimeoutHandler()
    _setupTimeoutHandler(opts, event, context)

    const _bucketName = bucketName || (opts && opts.s3 && opts.s3.bucketName)
    if (!_bucketName) {
        return
    }

    const _samplingInterval =
        samplingInterval ||
        (opts && opts.samplingInterval) ||
        MIDDY_PROFILER_SAMPLING_INTERVAL_DEFAULT_VALUE
    try {
        if (!isProfilerStarted()) {
            await startProfiler(_samplingInterval)
        }
    } catch (e) {
        logger.error('Unable to start profiler:', e)
    }
}

const _afterInvocation = async (
    opts,
    event,
    context,
    response,
    error,
    timeout
) => {
    _destroyTimeoutHandler()

    if (!isProfilerStarted()) {
        return
    }

    try {
        const _profilingData = await finishProfiler()
        const _bucketName =
            bucketName || (opts && opts.s3 && opts.s3.bucketName)
        const _pathPrefix =
            pathPrefix || (opts && opts.s3 && opts.s3.pathPrefix) || ''
        const _fileName =
            fileName ||
            (opts && opts.s3 && opts.s3.fileName) ||
            MIDDY_PROFILER_S3_FILE_NAME_DEFAULT_VALUE
        await reportToS3(
            _profilingData,
            _bucketName,
            _pathPrefix,
            _fileName,
            context.functionName,
            context.awsRequestId
        )
    } catch (e) {
        logger.error('Unable to finish profiler:', e)
    }
}

module.exports = {
    beforeInvocation: _beforeInvocation,
    afterInvocation: _afterInvocation,
}
