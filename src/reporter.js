let s3Client

module.exports.reportToS3 = async function (
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
