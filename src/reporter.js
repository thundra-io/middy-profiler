let s3Client

module.exports.reportToS3 = async function (
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

    return isSDKV3() ? reportWithSDKV3(params) : reportWithSDKV2(params)
}

// Starting from Node18, Lambda includes JS SDK V3
function isSDKV3() {
    const nodeVersion = process.versions.node.split('.')[0]
    return nodeVersion >= 18
}

function reportWithSDKV3(params) {
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

    if (!s3Client) {
        s3Client = new S3Client()
    }

    const putObjectCommand = new PutObjectCommand(params)
    return s3Client.send(putObjectCommand)
}

function reportWithSDKV2(params) {
    if (!s3Client) {
        const S3 = require('aws-sdk/clients/s3')
        s3Client = new S3()
    }

    return s3Client.putObject(params).promise()
}
