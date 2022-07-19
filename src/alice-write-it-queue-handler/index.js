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
            /** @type {AliceEvent<CustomIntent>} */
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

      const intents = body.request?.nlu?.intents

      /** @type {'food' | 'exercise' | 'life' | 'note' | undefined} */
      let type

      /** @type {string | undefined} */
      let item

      /** @type {number | undefined} */
      let quantity

      /** @type {string | undefined} */
      let uom

      /** @type {string | undefined} */
      let dish

      /** @type {number | undefined} */
      let dishNum

      /** @type {number | undefined} */
      let barcode

      /** @type {string | undefined} */
      let description

      if (intents?.food) {
        type = 'food'
      } else if (intents.exercise) {
        type = 'exercise'
      } else if (intents.life) {
        type = 'life'
      } else if (intents.note) {
        type = 'note'
      }

      if (type) {
        if (type !== 'note') {
          item = intents[type].slots?.item?.value
          quantity = intents[type].slots?.quantity?.value
        }

        if (type === 'food' || type === 'exercise') {
          quantity = intents[type].slots?.quantity?.value
          uom = intents[type].slots?.uom?.value
        }

        if (type === 'food') {
          dish = intents[type].slots?.dish?.value
          dishNum = intents[type].slots?.dishNum?.value
          barcode = intents[type].slots?.barcode?.value
        }

        description = intents[type].slots?.description?.value
      }

      return [
        {
          'Дата': timestamp,
          'Событие': phrase,
          'Тип': type,
          'Предмет': item,
          'Кол-во': quantity,
          'Ед. изм.': uom,
          'Блюдо': [dish ?? dishNum].filter(it => it).map(it => String(it))[0],
          'Штрихкод': barcode,
          'Прочее': description
        }
      ]
    }) ?? []

  const resp = await fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ rows })
  })

  /** @type {LifeLogScriptResponse} */
  // @ts-expect-error returns unknown
  const result = await resp.json()

  console.log('result -', result)
}
