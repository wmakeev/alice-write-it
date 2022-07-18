// @ts-check

const { fetch } = require('undici')
const { env } = require('./env')

const { SCRIPT_URL } = env

/**
 * Обработчик событий из очереди
 *
 * @param {MessageQueueTriggerLambdaEvent} event
 * @param {LambdaContext} context
 * @returns {Promise<void>}
 */
module.exports.handler = async function (event, context) {
  console.log(JSON.stringify(event))

  const rows =
    event.messages?.flatMap(msg => {
      const timestamp =
        msg.event_metadata?.created_at &&
        new Date(msg.event_metadata.created_at).getTime()

      const body = [msg.details?.message?.body]
        .map(it => it)
        .map(body => {
          try {
            return JSON.parse(body)
          } catch (err) {
            console.log(`Error body parsing - ${body}`)
            return null
          }
        })[0]

      if (!timestamp || !body) return []

      return [
        {
          timestamp,
          text: body.request.original_utterance
        }
      ]
    }) ?? []

  const postBody = {
    rows: rows.map(row => [row.timestamp, row.text])
  }

  const resp = await fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify(postBody)
  })

  const result = await resp.json()

  console.log('result -', result)
}
