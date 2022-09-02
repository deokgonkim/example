
/**
 * Returns `ReportBatchItemFailures`
 * for SQS partial failure
 * @param {*} failedMessageIds 
 * @returns 
 */
const batchItemFailures = (failedMessageIds) => {
    return {
        batchItemFailures: failedMessageIds.map(id => {
            return {
                itemIdentifier: id
            }
        })
    }
}


const handle = async (event, context) => {
    console.log("event", event)
    const failedMessageIds = []
    console.log("Received records", event.Records.length)
    let i = 0
    event.Records.forEach((record) => {
        i += 1
        const messageId = record.messageId
        try {
            const sqsMessageBody = record.body
            const sqsMessageAsObject = JSON.parse(sqsMessageBody)
            // console.log(`Processing ${sqsMessageBody}`)
            const id = sqsMessageAsObject.id
            console.log(`Processing ${id}`)
            // to test partial failure. manually throw some error
            if (i % 3 == 0) {
                console.log(`Processing ${id} fail`)
                throw new Error(`Every 3th message should fail`)
            }
        } catch (e) {
            console.log(e)
            failedMessageIds.push(messageId)
        }
    })
    return batchItemFailures(failedMessageIds)
}

module.exports = {
    handle
}
