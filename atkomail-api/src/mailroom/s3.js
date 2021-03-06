var AWS = require('aws-sdk');
var s3 = new AWS.S3();
const winston = require("winston");
var bucketName = process.env.BUCKET;
const notificationsDB = new AWS.DynamoDB.DocumentClient()
const apiGateway = new AWS.ApiGatewayManagementApi({endpoint: "1uoy7q9beh.execute-api.us-east-1.amazonaws.com/dev"})

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
    ],
});

module.exports.sort = async (event) => {
    var destination;

    try {
        var sesNotification = event.Records[0].ses;

        for (let index = 0; index < sesNotification.mail.headers.length; index++) {
            const element = sesNotification.mail.headers[index];
            if(element.name === "Received"){
                destination = element.value.split(' for ')[1].split(';')[0]
                break;
            }
        }

        if(destination){
            destination = destination.toLowerCase()
            logger.info("Processing mail",{
                messageId: sesNotification.mail.messageId,
                source: sesNotification.mail.source,
                subject: sesNotification.mail.commonHeaders.subject,
                destination: destination, 
                mailbox: destination.split('@')[0],
                domain: destination.split('@')[1]})
            var copyParams = {
                Bucket: bucketName, 
                CopySource: bucketName+"/"+sesNotification.mail.messageId, 
                Key: destination+"/"+Date.now()+"-"+Math.floor(Math.random() * 1000)
            };
        
            await s3.copyObject(copyParams).promise()
        
            var deleteParams = {
                Bucket: bucketName,
                Key: sesNotification.mail.messageId, 
            }
            await s3.deleteObject(deleteParams).promise()
        }
        else {
            logger.error("Unable to find destination mailbox mail", {mail: sesNotification.mail})
        }
        
    } catch (error) {
        logger.error("Unable to sort mail", {error: error})
    }

    //update any clients waiting on this box
    try{
        var params = {
            TableName: process.env.DYNAMO_TABLE_NAME,
            FilterExpression: "#mb = :mailbox",
            ExpressionAttributeNames:{
                "#mb": "mailbox"
            },
            ExpressionAttributeValues: {
                ":mailbox": destination
            }
        }
        
        var response = await notificationsDB.scan(params).promise()

        await Promise.all(response.Items.map(async (item) => {
            try {
                logger.debug("Attempting to notify client",{client: item.connectionId, mailbox:item.mailbox})
                var x = await apiGateway.postToConnection({ConnectionId:item.connectionId,Data:"refresh your box"}).promise()
                logger.info("Notified client",{client: item.connectionId, mailbox:item.mailbox, val: x})
            } catch (e) {
                if(e.code === "GoneException"){
                    logger.info("Connection is gone, removing from DB",{client: item.connectionId, mailbox:item.mailbox})
                    var deleteParams = {
                        TableName: process.env.DYNAMO_TABLE_NAME,
                        "Key" : {
                            'connectionId': item.connectionId
                        }
                    }
                    await notificationsDB.delete(deleteParams).promise()
                } else {
                    logger.error("Unable to notify client ${item.connectionId} of change",{error: e})
                }
            }
          }));
    } catch (error) {
        console.error("Unable to notify any client of mail changes", {error: error})
    }
}