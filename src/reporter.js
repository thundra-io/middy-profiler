let s3Client
let putObjectCommand

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

    if (!s3Client) {
        if (isSDKV3()) {
            const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'); 
            s3Client = new S3Client();
            putObjectCommand = new PutObjectCommand(params);
        } else {
            const S3 = require('aws-sdk/clients/s3');
            s3Client = new S3();
        }
    }

    return isSDKV3()
        ? s3Client.send(putObjectCommand)
        : s3Client.putObject(params).promise();
}

// Starting from Node18, Lambda includes JS SDK V3
function isSDKV3() {
    const nodeVersion = process.versions.node.split('.')[0];
    return nodeVersion >= 18;
}