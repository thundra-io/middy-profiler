module.exports.warn = function (msg) {
    console.warn('[MIDDY-PROFILER]', msg)
}

module.exports.error = function (msg, e) {
    console.error('[MIDDY-PROFILER]', msg, e)
}
