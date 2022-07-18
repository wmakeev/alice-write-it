// @ts-check

const AWS = require('aws-sdk')
const { env } = require('./env')

const { QUEUE_URL } = env

const mq = new AWS.SQS({
  region: 'ru-central1',
  endpoint: 'https://message-queue.api.cloud.yandex.net'
})

/** Стартовые фразы которые могут включаться в сам текст */
const dropStartPhrase = [
  'попроси записать фразу ',
  'попроси сделать пометку ',
  'попроси записать лог '
]

const shouldClosePhrases = ['сон', 'пробуждение']

/**
 * Обработчик событий от Алисы
 *
 * @param event {AliceEvent} request payload.
 * @param context {LambdaContext} information about current execution context.
 *
 * @return {Promise<Object>} response to be serialized as JSON.
 */
module.exports.handler = async (event, context) => {
  const { version, session, request } = event

  let endSession = false
  let text = 'Скажите фразу и она будет записана в лог'

  try {
    if (request['original_utterance'].length > 0) {
      /** @type {string} Фраза */
      let phrase = request['original_utterance']?.toLowerCase()

      console.log('request.original_utterance -', phrase)

      const dropStart = dropStartPhrase.find(it => phrase.startsWith(it))

      if (dropStart) {
        phrase = phrase.substring(dropStart.length)
      }

      endSession = shouldClosePhrases.includes(phrase)

      text = 'Записано - ' + phrase

      const params = {
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify(event)
      }

      await mq.sendMessage(params).promise()
    }
  } catch (/** @type {any} */ err) {
    console.log(err.message)

    endSession = true
    text = 'Произошла ошибка, попробуйте обратиться позже.'
  }

  return {
    version,
    session,
    response: {
      text,
      end_session: endSession
    }
  }
}
