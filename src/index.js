const inspector = require('inspector')
const session = new inspector.Session()
const aws = require('aws-sdk')
const s3 = new aws.S3()

async function _sessionPost(key, obj = {}) {
    return new Promise((resolve, reject) => {
        session.post(key, obj, (err, msg) => (err ? reject(err) : resolve(msg)))
    })
}

async function _startProfiler(samplingInterval) {
    session.connect()

    await _sessionPost('Profiler.enable')
    await _sessionPost('Profiler.setSamplingInterval', {
        interval: samplingInterval,
    })
    await _sessionPost('Profiler.start')
}

async function _finishProfiler() {
    try {
        const { profile } = await _sessionPost('Profiler.stop')
        return profile
    } finally {
        session.disconnect()
    }
}

async function _putProfilingDataToS3(
    profilingData,
    bucketName,
    pathPrefix,
    fileName,
    functionName,
    awsRequestId
) {
    const params = {
        Body: JSON.stringify(profilingData),
        Bucket: bucketName,
        Key: `${pathPrefix}${functionName}/${awsRequestId}/${fileName}.cpuprofile`,
    }
    return s3.putObject(params).promise()
}

const profilerMiddleware = (opts = {}) => {
    const samplingInterval =
        parseInt(process.env['MIDDY_PROFILER_SAMPLING_INTERVAL']) ||
        (opts && opts.samplingInterval) ||
        10
    const bucketName =
        process.env['MIDDY_PROFILER_S3_BUCKET_NAME'] ||
        (opts && opts.s3 && opts.s3.bucketName)
    const pathPrefix =
        process.env['MIDDY_PROFILER_S3_PATH_PREFIX'] ||
        (opts && opts.s3 && opts.s3.pathPrefix) ||
        ''
    const fileName =
        process.env['MIDDY_PROFILER_S3_FILE_NAME'] ||
        (opts && opts.s3 && opts.s3.fileName) ||
        'cpu_profile'

    const _onStart = async (request) => {
        if (!bucketName) {
            return
        }
        try {
            await _startProfiler(samplingInterval)
            request.internal.middyProfiler = {
                profilerStarted: true,
            }
        } catch (e) {
            console.error('Unable to start profiler:', e)
        }
    }

    const _onFinish = async (request) => {
        const profilerStarted =
            request.internal.middyProfiler &&
            request.internal.middyProfiler.profilerStarted
        if (!profilerStarted) {
            return
        }

        try {
            const profilingData = await _finishProfiler()
            await _putProfilingDataToS3(
                profilingData,
                bucketName,
                pathPrefix,
                fileName,
                request.context.functionName,
                request.context.awsRequestId
            )
        } catch (e) {
            console.error('Unable to finish profiler:', e)
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
