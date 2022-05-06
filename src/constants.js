const MIDDY_PROFILER_ENABLE_ENV_VAR_NAME = 'MIDDY_PROFILER_ENABLE'
const MIDDY_PROFILER_SAMPLING_INTERVAL_ENV_VAR_NAME =
    'MIDDY_PROFILER_SAMPLING_INTERVAL'
const MIDDY_PROFILER_S3_BUCKET_NAME_ENV_VAR_NAME =
    'MIDDY_PROFILER_S3_BUCKET_NAME'
const MIDDY_PROFILER_S3_PATH_PREFIX_ENV_VAR_NAME =
    'MIDDY_PROFILER_S3_PATH_PREFIX'
const MIDDY_PROFILER_S3_FILE_NAME_ENV_VAR_NAME = 'MIDDY_PROFILER_S3_FILE_NAME'
const MIDDY_PROFILER_HANDLER_ENV_VAR_NAME = 'MIDDY_PROFILER_HANDLER'

const MIDDY_PROFILER_SAMPLING_INTERVAL_DEFAULT_VALUE = 10
const MIDDY_PROFILER_S3_FILE_NAME_DEFAULT_VALUE = 'cpu_profile'

module.exports = {
    MIDDY_PROFILER_ENABLE_ENV_VAR_NAME,
    MIDDY_PROFILER_SAMPLING_INTERVAL_ENV_VAR_NAME,
    MIDDY_PROFILER_S3_BUCKET_NAME_ENV_VAR_NAME,
    MIDDY_PROFILER_S3_PATH_PREFIX_ENV_VAR_NAME,
    MIDDY_PROFILER_S3_FILE_NAME_ENV_VAR_NAME,
    MIDDY_PROFILER_HANDLER_ENV_VAR_NAME,

    MIDDY_PROFILER_SAMPLING_INTERVAL_DEFAULT_VALUE,
    MIDDY_PROFILER_S3_FILE_NAME_DEFAULT_VALUE,
}
