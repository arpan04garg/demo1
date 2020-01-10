const crypto = require('crypto');
const AWS = require('aws-sdk');
AWS.config.update({region: process.env.REGION});
const dbClient = new AWS.DynamoDB.DocumentClient();
const CONSTANTS = require('./CONSTANTS.js');
const TABLE_NAME = `${process.env.STAGE}${CONSTANTS.TABLE_NAME}`;
const USER_TABLE_NAME = `${process.env.STAGE}${CONSTANTS.USER_TABLE_NAME}`;

const generateUserId = (email) => {
    let userID = crypto.createHash('sha256').update(email).digest("hex");
    userID = crypto.createHash('sha256').update(userID).digest("hex");
    console.log("UserID ", userID);
    return userID;
};

const checkUser = async (userId) => {
    const params = {
        TableName : USER_TABLE_NAME,
        KeyConditionExpression : "#uid = :id",
        ExpressionAttributeValues: {
            ':id': userId
        },
        ExpressionAttributeNames: {
            '#uid': 'userID'
        }
    };
    const { Count } = await dbClient.query(params).promise();
    return Count == 0 ? false : true;
};

let queryDb = async (params) => {
    let docClient = new AWS.DynamoDB.DocumentClient();
    return docClient.query(params).promise();
};

const getTagData = async (userId, from, to, limit, nextPaginationKey, sort) => {
    let params = {
        "TableName": TABLE_NAME,
        KeyConditionExpression: "#uid = :id AND tagDate BETWEEN :minDate AND :maxDate",
        ExpressionAttributeValues: {
            ':id':userId,
            ':minDate': from,
            ':maxDate': to
        },
        ExpressionAttributeNames: {
            '#uid': 'userId'
        }
    };
    if( limit ) {
        params.Limit = Number(limit);
    }
    if( nextPaginationKey ) {
        params.ExclusiveStartKey = {"uuid": userId, "tagDate": Number(nextPaginationKey)};
    }
    if( sort && sort.toLowerCase() === 'desc' ) {
        params.ScanIndexForward = false;
    }
    let Items = await queryDb(params);
    Items.Items = Items.Items.filter(({ attributes }) => Number(attributes.deleteFlag) != 1).map(({ id, userId, createdDate, modifiedDate, ...rest }) => ({ ...rest }));
    let responseObj = {"success": true, "data": Items.Items};
    if( Items && Items.LastEvaluatedKey ) {
        responseObj.nextpaginationKey = Items.LastEvaluatedKey.tagDate;
    }
    return Promise.resolve(responseObj);
};

const applyValidation = async ({ emailAddress, fromDate, toDate, Limit, nextPaginationKey, sort }) => {
    try {
        let userId = generateUserId(emailAddress.toLowerCase());
        if( !fromDate ) return Promise.resolve({"success": false, "message": CONSTANTS.FROM_DATE_REQ, "errorCode": "REQUIRED_PARAMETER"});
        if( !toDate )
            toDate = new Date().getTime();
        const validateUser = await checkUser(userId);
        if( !validateUser ) return Promise.resolve({"success": false, "message": 'User not found', "errorCode": "USER_NOT_FOUND"});
        return await getTagData(userId, Number(fromDate), Number(toDate), Limit, nextPaginationKey, sort);
    } catch (error) {
        console.log(error);
        return Promise.resolve({"success": false, "message": error.message, "errorCode": "INTERNAL_SERVER_ERROR"});
    }
};

exports.handler = async (event, context, callback) => {
    const response = await applyValidation(event);
    callback(null, response);
};