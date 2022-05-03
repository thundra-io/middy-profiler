const {
    startProfiler,
    finishProfiler,
    isProfilerStarted,
} = require('./profiler')
const {
    MIDDY_PROFILER_SAMPLING_INTERVAL_ENV_VAR_NAME,
    MIDDY_PROFILER_S3_BUCKET_NAME_ENV_VAR_NAME,
    MIDDY_PROFILER_S3_PATH_PREFIX_ENV_VAR_NAME,
    MIDDY_PROFILER_S3_FILE_NAME_ENV_VAR_NAME,
    MIDDY_PROFILER_SAMPLING_INTERVAL_DEFAULT_VALUE,
    MIDDY_PROFILER_S3_FILE_NAME_DEFAULT_VALUE,
} = require('./constants')
const logger = require('./logger')

let s3Client

async function _putProfilingDataToS3(
    profilingData,
    bucketName,
    pathPrefix,
    fileName,
    functionName,
    awsRequestId
) {
    if (!s3Client) {
        const S3 = require('aws-sdk/clients/s3')
        s3Client = new S3()
    }
    const params = {
        Body: JSON.stringify(profilingData),
        Bucket: bucketName,
        Key: `${pathPrefix}${functionName}/${awsRequestId}/${fileName}.cpuprofile`,
    }
    return s3Client.putObject(params).promise()
}

const profilerMiddleware = (opts = {}) => {
    const samplingInterval =
        parseInt(process.env[MIDDY_PROFILER_SAMPLING_INTERVAL_ENV_VAR_NAME]) ||
        (opts && opts.samplingInterval) ||
        MIDDY_PROFILER_SAMPLING_INTERVAL_DEFAULT_VALUE
    const bucketName =
        process.env[MIDDY_PROFILER_S3_BUCKET_NAME_ENV_VAR_NAME] ||
        (opts && opts.s3 && opts.s3.bucketName)
    const pathPrefix =
        process.env[MIDDY_PROFILER_S3_PATH_PREFIX_ENV_VAR_NAME] ||
        (opts && opts.s3 && opts.s3.pathPrefix) ||
        ''
    const fileName =
        process.env[MIDDY_PROFILER_S3_FILE_NAME_ENV_VAR_NAME] ||
        (opts && opts.s3 && opts.s3.fileName) ||
        MIDDY_PROFILER_S3_FILE_NAME_DEFAULT_VALUE

    const _onStart = async (request) => {
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

    const _onFinish = async (request) => {
        if (!isProfilerStarted()) {
            return
        }

        try {
            const profilingData = await finishProfiler()
            await _putProfilingDataToS3(
                profilingData,
                bucketName,
                pathPrefix,
                fileName,
                request.context.functionName,
                request.context.awsRequestId
            )
        } catch (e) {
            logger.error('Unable to finish profiler:', e)
        }
    }

    const profilerMiddlewareBefore = async (request) => {
        await _onStart(request)
    }

    const profilerMiddlewareAfter = async (request) => {
        await _onFinish(request)
    }

    const profilerMiddlewareOnError = async (request) => {
        await _onFinish(request)
    }

    return {
        before: profilerMiddlewareBefore,
        after: profilerMiddlewareAfter,
        onError: profilerMiddlewareOnError,
    }
}

module.exports = profilerMiddleware
