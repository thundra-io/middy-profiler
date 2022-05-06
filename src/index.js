const controller = require('./controller')
const { MIDDY_PROFILER_ENABLE_ENV_VAR_NAME } = require('./constants')

const profilerMiddleware = (opts = {}) => {
    const enable =
        (process.env[MIDDY_PROFILER_ENABLE_ENV_VAR_NAME] || 'true') === 'true'

    const _onStart = async (request) => {
        await controller.beforeInvocation(opts, request.event, request.context)
    }

    const _onFinish = async (request) => {
        await controller.afterInvocation(
            opts,
            request.event,
            request.context,
            request.response,
            request.error,
            false
        )
    }

    const profilerMiddlewareBefore = async (request) => {
        if (!enable) {
            return
        }
        await _onStart(request)
    }

    const profilerMiddlewareAfter = async (request) => {
        if (!enable) {
            return
        }
        await _onFinish(request)
    }

    const profilerMiddlewareOnError = async (request) => {
        if (!enable) {
            return
        }
        await _onFinish(request)
    }

    return {
        before: profilerMiddlewareBefore,
        after: profilerMiddlewareAfter,
        onError: profilerMiddlewareOnError,
    }
}

module.exports = profilerMiddleware
