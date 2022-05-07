# Change Log

All notable changes to this project will be documented in this file. 
See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.0.9"></a>
# 1.0.9 (2022-05-07)

### Features

* Add option (`report.durationThreshold`) based configuration support for **"report duration threshold"** feature

<a name="1.0.8"></a>
# 1.0.8 (2022-05-07)

### Features

* Add **"report duration threshold"** support  (configured by `MIDDY_PROFILER_REPORT_DURATION_THRESHOLD` env var) to be able to report profiling data conditionally if the invocation duration is higher than the specified threshold

<a name="1.0.7"></a>
# 1.0.7 (2022-05-07)

### Improvements

* Handle "start-delay" support at coldstart

<a name="1.0.6"></a>
# 1.0.6 (2022-05-07)

### Features

* Add **"start-delay"** support (configured by `MIDDY_PROFILER_START_DELAY` env var or `startDelay` option) to be able to start profiler after specified time (for ex. invocation took longer than expected)

<a name="1.0.5"></a>
# 1.0.5 (2022-05-07)

### Improvements

* Finish profiler (and report data) just before timeout occurs

<a name="1.0.4"></a>
# 1.0.4 (2022-05-06)

### Features

* Add env var flag (`MIDDY_PROFILER_ENABLE` which is `true` by default) to be able to enable/disable profiler

<a name="1.0.3"></a>
# 1.0.3 (2022-05-06)

### Features

* Support standalone mode to be able to use profiler without `middy` framework

<a name="1.0.2"></a>
# 1.0.2 (2022-05-03)

### Features

* Support profiling since init phase at coldstart

<a name="1.0.1"></a>
# 1.0.1 (2022-05-02)

### Improvements

* Reduce coldstart overhead for the initialization of the profiler

<a name="1.0.0"></a>
# 1.0.0 (2021-12-02)

### Features

* Ready to use public release 

<a name="0.0.1"></a>
# 0.0.1 (2021-11-30)

### Features

* Initial release
