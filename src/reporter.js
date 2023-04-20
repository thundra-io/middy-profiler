const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3"); 

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
        s3Client = new S3Client();
    }

    const params = {
        Body: JSON.stringify(profilingData),
        Bucket: bucketName,
        Key: `${pathPrefix}${functionName}/${awsRequestId}/${fileName}.cpuprofile`,
    }
    const putObjectCommand = new PutObjectCommand(params);
    
    return await s3Client.send(putObjectCommand)
}