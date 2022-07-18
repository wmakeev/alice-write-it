type AliceNluEntity =
  | {
      type: 'YANDEX.NUMBER'
      tokens: { start: number; end: number }
      value: number
    }
  | {
      type: 'YANDEX.STRING'
      tokens: { start: number; end: number }
      value: string
    }
  | {
      type: string
      tokens: { start: number; end: number }
      value: string
    }

type AliceNluIntents = Record<
  string,
  {
    slots: { [name: string]: AliceNluEntity }
  }
>

interface AliceEvent<Intents extends AliceNluIntents = AliceNluIntents> {
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
      entities: AliceNluEntity[]
      intents: Intents
    }
    markup: { dangerous_context: boolean }
  }
  version: '1.0'
}

type CustomIntent = {
  food: {
    slots: {
      item?: {
        type: 'Food'
        tokens: { start: number; end: number }
        value: string
      }
      quantity?: {
        type: 'YANDEX.NUMBER'
        tokens: { start: number; end: number }
        value: number
      }
      uom?: {
        type: 'YANDEX.STRING'
        tokens: { start: number; end: number }
        value: 'штуки'
      }
      dish?: {
        type: 'YANDEX.STRING'
        tokens: { start: number; end: number }
        value: string
      }
      dishNum?: {
        type: 'YANDEX.NUMBER'
        tokens: { start: number; end: number }
        value: number
      }
      barcode?: {
        type: 'YANDEX.NUMBER'
        tokens: { start: number; end: number }
        value: number
      }
    }
  }
  exercise: {
    slots: {
      item?: {
        type: 'Exercise'
        tokens: { start: number; end: number }
        value: string
      }
      quantity?: {
        type: 'YANDEX.NUMBER'
        tokens: { start: number; end: number }
        value: number
      }
      uom?: {
        type: 'YANDEX.STRING'
        tokens: { start: number; end: number }
        value: 'подход'
      }
    }
  }
}
