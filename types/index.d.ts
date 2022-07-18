/**
 * Триггер для Message Queue
 * @link https://cloud.yandex.ru/docs/functions/concepts/trigger/ymq-trigger
 */
interface MessageQueueTriggerLambdaEvent {
  messages: Array<{
    event_metadata: {
      event_id: string
      event_type: 'yandex.cloud.events.messagequeue.QueueMessage'
      /** Например: `2019-09-24T00:54:28.980441Z` */
      created_at: string
      tracing_context: null
      cloud_id: string
      folder_id: string
    }
    details: {
      /** Пример: `yrn:yc:ymq:ru-central1:21i6v0tesmsaoeon7pas:event-queue` */
      queue_id: string
      message: {
        message_id: string
        md5_of_body: string
        body: string
        attributes: {
          ApproximateFirstReceiveTimestamp: string
          ApproximateReceiveCount: string
          /** Строка `1569285804456` */
          SentTimestamp: string
        }
        message_attributes: {
          messageAttributeKey: {
            dataType: 'StringValue'
            stringValue: 'value'
          }
        }
        md5_of_message_attributes: string
      }
    }
  }>
}

interface AliceEvent {
  meta: {
    locale: 'ru-RU'
    /** `Asia/Yekaterinburg` */
    timezone: string
    /** `aliced/1.0 (Yandex yandexmini; Linux 1.0)` */
    client_id: string
    interfaces: { payments: {}; account_linking: {} }
  }
  session: {
    message_id: number
    session_id: string
    skill_id: string
    user: {
      user_id: string
    }
    application: {
      application_id: string
    }
    user_id: string
    new: boolean
  }
  request: {
    type: 'SimpleUtterance'
    command: string
    original_utterance: string
    nlu: {
      tokens: string[]
      entities: []
      intents: {}
    }
    markup: { dangerous_context: boolean }
  }
  version: '1.0'
}

interface LambdaContext {
  deadlineMs: number
  token: {
    access_token: string
  }
}

type LifeLogScriptResponse =
  | {
      ok: true
    }
  | { ok: false; description: string }
