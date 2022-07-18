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
    }
    details: {
      /** Пример: `yrn:yc:ymq:ru-central1:21i6v0tesmsaoeon7pas:event-queue` */
      queue_id: string
      message: {
        message_id: string
        md5_of_body: string
        body: string
        attributes: {
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

interface LambdaContext {
  deadlineMs: number
  token: {
    access_token: string
  }
}
