// @ts-check

const { fetch } = require('undici')
const { env } = require('./env')

const { SCRIPT_URL } = env

/** Стартовые фразы которые могут включаться в сам текст */
const dropStartPhrase = [
  'попроси записать фразу ',
  'попроси сделать пометку ',
  'попроси записать лог '
]

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
            /** @type {AliceEvent} */
            const aliceEvent = JSON.parse(body)
            return aliceEvent
          } catch (err) {
            console.log(`Error body parsing - ${body}`)
            return null
          }
        })[0]

      if (!timestamp || !body) return []

      let phrase = body.request.original_utterance

      const dropStart = dropStartPhrase.find(it => phrase.startsWith(it))

      if (dropStart) {
        phrase = phrase.substring(dropStart.length)
      }

      return [
        {
          timestamp,
          text: phrase
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

  /** @type {LifeLogScriptResponse} */
  // @ts-expect-error returns unknown
  const result = await resp.json()

  console.log('result -', result)
}
