const middy = require('@middy/core')
const cors = require('@middy/http-cors')
const AWS = require('aws-sdk');
const dynamoClient = new AWS.DynamoDB.DocumentClient()
const winston = require("winston");
var Mixpanel = require('mixpanel');

var mixpanel = Mixpanel.init(
    process.env.MIX_PANEL_TOKEN,
    {
      host: "api-eu.mixpanel.com",
    },
  );

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
    ],
});

const baseHandler = async (event) => {
    logger.defaultMeta = { requestId: event.requestContext.requestId, principal: event.requestContext.authorizer.principalId };
    logger.debug("Get domains called.",{context:event.requestContext})
    mixpanel.track("Get domains", {distinct_id:event.requestContext.authorizer.principalId})
    try {       
        var params = {
            TableName: process.env.DOMAINS_TABLE_NAME,
            KeyConditionExpression: "#owner = :owner",
            ExpressionAttributeNames:{
                "#owner": "owner"
            },
            ExpressionAttributeValues: {
                ":owner": event.requestContext.authorizer.uid
            }
        }

        var response = await dynamoClient.query(params).promise()
        logger.debug("dynamo stage completed", {dynamoResponse: response})

        var userDomains = []
        response.Items.forEach(element => {
            userDomains.push(element.domain)
        });
        var identities = await new AWS.SES({apiVersion: '2010-12-01'}).getIdentityVerificationAttributes({Identities: userDomains}).promise();
        logger.debug("SES stage completed", {sesResponse: identities})

        response.Items.forEach(element => {
            element.status = identities.VerificationAttributes[element.domain].VerificationStatus
            if(element.status!='Success'){
                element.verification = identities.VerificationAttributes[element.domain].VerificationToken
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                domains: response.Items
            })
        }
    }
    catch(error){
        logger.error("Unable to process get domain request",{error: error})
        return{
            status: 500,
            error: "Something failed, sorry."
        }
    }

}

const handler = middy(baseHandler)
.use(cors({
    credentials: true,
    origins: process.env.ORIGINS.split(' ')
}))

module.exports = {handler}