const AWS = require('aws-sdk')

const STAGE = process.env.STAGE || 'dev'
const REGION = process.env.AWS_REGION || 'ap-northeast-2'


AWS.config.update({region: REGION})

const DYNAMODB_endpoint = process.env.LOCAL ? new AWS.Endpoint('http://localhost:8000') : undefined
console.log(`Dynamo Endpoint : ${JSON.stringify(DYNAMODB_endpoint)}`)

const DynamoDB = new AWS.DynamoDB({apiVersion: '2012-08-10', endpoint: DYNAMODB_endpoint})

const listTables = async () => {
    const tables = await DynamoDB.listTables().promise()
    console.log(tables)
    return tables
}


const getAllUsers = async () => {
    const result = await DynamoDB.scan({
        TableName: USER_TABLE_NAME
    }).promise()
    return result
}

const scanFromTable = async (table_name) => {
    const result = await DynamoDB.scan({
        TableName: table_name
    }).promise()
    return result
}

const findByStringKeyFromTable = async (key_name, key, table_name) => {
    const result = await DynamoDB.getItem({
        TableName: table_name,
        Key: {
            [key_name]: { S: key }
        }
    }).promise()
    return result ? result.Item : null
}

const findByPk = async (key_name, key, table_name) => {
    const result = await DynamoDB.getItem({
        TableName: table_name,
        Key: {
            [key_name]: { S: key }
        }
    }).promise()
    if (result) {
        for (const key in result.Item) {
            const v = result.Item[key]['S'] || result.Item[key]['N']
            result.Item[key] = v
        }
    }
    return result ? result.Item : null
}

/**
 * 
 * @param {object} filters
 * @param {*} table_name 
 * @returns 
 */
const findAllFromTable = async (filters, table_name) => {

    const params = {
        TableName: table_name,
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {},
        FilterExpression: []
    }

    for (const key in filters) {
        const v = filters[key]
        
        if (v instanceof Number) {
            params.ExpressionAttributeValues[`:${key}`] = { 'N': v }
        } else {
            params.ExpressionAttributeValues[`:${key}`] = { 'S': v }
        }
        if (key == 'id') {
            continue
        }
        params.ExpressionAttributeNames[`#${key}`] = `${key}`
        params.FilterExpression.push(`#${key} = :${key}`)
    }

    params.FilterExpression = params.FilterExpression.join(' AND ')
    console.log("Params : ", params)
    // const options = {
    //     TableName: table_name,
    //     // Key: Key,
    //     KeyConditions: Key
    // }
    const result = await DynamoDB.scan(params).promise().catch((err) => {
        console.log('Error', err)
        throw err
    })
    // return result
    if (result) {
        for (const item of result.Items) {
            for (const key in item) {
                const v = item[key]['S'] || item[key]['N']
                item[key] = v
            }
        }
    }
    return result ? result.Items : null
}

const insertItem = async (table_name, item) => {
    const insertingItem = {}
    for (const key in item) {
        const v = item[key]
        if (v instanceof Number) {
            insertingItem[key] = { 'N': v }
        } else {
            insertingItem[key] = { 'S': v }
        }
    }
    const result = await DynamoDB.putItem({
        TableName: table_name,
        Item: insertingItem
    }).promise()
    return findByStringKeyFromTable('id', item['id'], table_name)
}

module.exports = {
    STAGE,

    DynamoDB,
    listTables,

    getAllUsers,

    scanFromTable,
    findByStringKeyFromTable,
    findByPk,

    findAllFromTable,

    insertItem
}