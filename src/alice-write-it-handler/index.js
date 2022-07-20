// @ts-check

const AWS = require('aws-sdk')
const { env } = require('./env')

const { QUEUE_URL } = env

const mq = new AWS.SQS({
  region: 'ru-central1',
  endpoint: 'https://message-queue.api.cloud.yandex.net'
})

/** Стартовые фразы которые могут включаться в сам текст */
const dropStartPhrase = ['попроси записать фразу ', 'записать фразу ']

const cancelWord = 'отмена'

const shouldClosePhrases = ['сон', 'пробуждение']

/**
 * Обработчик событий от Алисы
 *
 * @param event {AliceEvent} request payload.
 * @param context {LambdaContext} information about current execution context.
 * @returns {Promise<AliceResponse>} response to be serialized as JSON.
 */
module.exports.handler = async (event, context) => {
  const { version, session, request } = event

  /**
   * @param {string} text
   * @param {boolean} endSession
   */
  const getResponse = (text, endSession) => {
    return {
      version,
      session,
      response: {
        text,
        end_session: endSession
      }
    }
  }

  try {
    if (!request.original_utterance) {
      return getResponse('Скажите фразу которую нужно записать', false)
    }

    console.log('request.original_utterance -', request.original_utterance)

    /** @type {string} Фраза */
    let phrase = request.original_utterance.toLowerCase()

    if (phrase.includes(cancelWord)) {
      return getResponse('Вы отменили запись этой фразы, повторите.', false)
    }

    const dropStart = dropStartPhrase.find(it => phrase.startsWith(it))

    if (dropStart) {
      phrase = phrase.substring(dropStart.length)
    }

    const params = {
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(event)
    }

    await mq.sendMessage(params).promise()

    let text = `Записано - ${phrase}`
    let endSession = shouldClosePhrases.includes(phrase)

    return getResponse(text, endSession)
  } catch (/** @type {any} */ err) {
    console.log(err.message)

    return getResponse('Произошла ошибка, попробуйте обратиться позже.', true)
  }
}
