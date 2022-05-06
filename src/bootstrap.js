const ORIGINAL_HANDLER_ENV_VAR_NAME = '_HANDLER'
const {
    MIDDY_PROFILER_ENABLE_ENV_VAR_NAME,
    MIDDY_PROFILER_HANDLER_ENV_VAR_NAME,
} = require('./constants')

const enable =
    (process.env[MIDDY_PROFILER_ENABLE_ENV_VAR_NAME] || 'true') === 'true'
if (!enable) {
    return
}

const userHandler = process.env[ORIGINAL_HANDLER_ENV_VAR_NAME]
const nodeVersion = parseInt(process.version.trim().replace(/^[=v]+/, ''))

let wrapperHandler
if (nodeVersion >= 14) {
    // Node.js 14+ versions support loading ES scripts as entry point.
    // So we can "await" profiler start task at the top level
    // before loading user handler during "INIT" phase.
    wrapperHandler = 'node_modules/middy-profiler/src/handler_es.wrapper'
} else {
    // Node.js 12- versions can only load CJS modules as entry point.
    // So we can't "await" profiler start task at the top level.
    // Instead, we are starting profiler task during "INIT" phase
    // but be sure that it is completed before loading user handler
    // by waiting at the first request just after "INIT" phase.
    wrapperHandler = 'node_modules/middy-profiler/src/handler_cjs.wrapper'
}

// Switch user handler with "middy-profiler" wrapper handler
process.env[ORIGINAL_HANDLER_ENV_VAR_NAME] = wrapperHandler
process.env[MIDDY_PROFILER_HANDLER_ENV_VAR_NAME] = userHandler
