/* global test */
import intake, { NlpResult, IntakeResult } from '../stages/intake'
import { WolfState, Ability, MessageType, ConvoState } from '../types';
import { randomElement, addMessageToQueue } from '../helpers'
import evaluate, { EvaluateResult } from '../stages/evaluate';
import fillSlots, { ValidateSlotsResult, validateSlots, FillSlotsResult } from '../stages/fillSlot';
import action, { ActionResult } from '../stages/action';
import outtake, { OuttakeResult } from '../stages/outtake';

const initialWolfState = {
  abilityCompleted: false,
  activeAbility: '',
  waitingFor: {
    slotName: null,
    turnCount: 0
  },
  messageQueue: [],
  pendingData: {}
}

type PizzaData = {
  pizzaType: string,
  pizzaSize: string,
  quantity: string  
}

const abilities: Ability[] = [
  {
    name: 'addOrder',
    slots: [
      {
        name: 'pizzaType',
        type: 'string',
        query: () => { return 'What type of pizza would you like?'},
        retry: (turnCount) => {
          const phrase = ['Please try again (attempt: 2)', 'Try harder.. (attempt: 3)']
          if (turnCount > phrase.length - 1) {
            return phrase[phrase.length - 1]
          }
          return phrase[turnCount]
        },
        validate: (value) => {
          // if (value.toLowerCase() === 'anchovy' || value.toLowerCase() === 'pineapple') {
          //   return { valid: false, reason: `${value} is not a good pizza.`}
          // }
          return { valid: true, reason: null }
        },
        onFill: (value) => `ok! type is set to ${value}.`
      },
      {
        name: 'pizzaSize',
        type: 'string',
        query: () => { return 'What size would you like?' },
        retry: (turnCount) => {
          const phrases: string[] = ['let\'s try again', 'What size would you like?']
          return randomElement(phrases)
        },
        validate: (value: string) => {
          // if (!value.toLowerCase().endsWith('L') && !value.toLowerCase().endsWith('S')) {
          //   return {
          //     valid: false,
          //     reason: 'Needs to set L or S',
          //   }
          // }
          return {
            valid: true
          }
        },
        onFill: (value) => `ok! size is set to ${value}.`
      },
      {
        name: 'quantity',
        type: 'number',
        query: () => 'how many pizzas would you like?',
        retry: () => {
          return 'that is not a number'
        },
        validate: (value) => {
          const valid = isNaN(+value)
          // if (valid) {
            return {
              valid: true                                                                      
            }
          // }
          // return {
          //   valid: false,
          //   reason: 'not a number'                                                
          // }
        },
        onFill: (value) => `ok! quantity is set to ${value}.`
      }
    ],
    onComplete: ({ getSubmittedData, getConvoState }) => {
      const order = getSubmittedData<PizzaData>()
      const convoState = getConvoState()
      const orders = convoState.orders || []
      convoState.orders = [
        ...orders,
        order       
      ]
      return `Your pizza order is added!`
    }
  },
  {
    name: 'removeOrder',
    slots: [
      {
        name: 'pizzaName',
        type: 'string',
        query: () => {
          return 'Which pizza order would you would like to remove?'
        }
      }
    ],
    onComplete: ({ getSubmittedData, getConvoState }) => {
      const convoState = getConvoState()
      const { pizzaName } = getSubmittedData<{pizzaName: string}>()
      const orders: PizzaData[] = convoState.orders || []

      // Check if pizza name exists
      if (!orders.some((order) => order.pizzaType === pizzaName)) {
        return `There is no ${pizzaName} pizza in your order`
      }

      // Remove alarm
      const newOrders = orders.filter(order => order.pizzaType !== pizzaName)
      convoState.orders = newOrders
      return `The ${pizzaName} pizza(s) has been removed`                                                
    }
  },
  {
    name: 'listOrders',
    slots: [],
    onComplete: ({ getConvoState }) => {
      const convoState = getConvoState()
      const orders: PizzaData[] = convoState.orders || []

      if (orders.length === 0) {
        return `You do not have any orders!`
      }
      return orders.map(order => order.quantity + order.pizzaSize + order.pizzaType + 'pizza(s)').join(', ')
    }
  },
  {
    name: 'listAbilities',
    slots: [],
    onComplete: ({ getAbilityList }) => {
      const abilityList = getAbilityList()
      const abilities = abilityList.map((ability) => ability.name).join(', ')
      const message = `Here are my abilities: ${abilities}`
      return message
    }
  }
] as Ability[]

describe('Add a Pizza a cart', () => { // Feature (ability)
  it('can receive order (all correct inputs)', async () => { // Test Scenario
    // NLP
    const nlpResult: NlpResult = {
      intent: 'addOrder',
      entities: [{
        value: 'everything',
        string: 'everything',
        name: 'pizzaType'
      }, {
        value: 'S',
        string: 'S',
        name: 'pizzaSize'
      }, {
        value: '1',
        string: '1',
        name: 'quantity'
      }]
    }
    const userMessage = 'add 1 S everything pizza to order'
    const wolfState: WolfState = {
      activeAbility: '',
      abilityCompleted: false,
      waitingFor: { slotName: null, turnCount: 0 },
      messageQueue: [],
      pendingData: {}
    }

    // Intake Stage
    const actualIntakeResult: IntakeResult = intake(wolfState, nlpResult, userMessage, 'listAbility')
    const expectedIntakeResult: IntakeResult = {
      pendingWolfState: {
        activeAbility: 'addOrder',
        abilityCompleted: false,
        waitingFor: { slotName: null, turnCount: 0 },
        messageQueue: [],
        pendingData: {}
      },
      nlpResult: {
        intent: 'addOrder',
        entities: [{
          value: 'everything',
          string: 'everything',
          name: 'pizzaType'
        }, {
          value: 'S',
          string: 'S',
          name: 'pizzaSize'
        }, {
          value: '1',
          string: '1',
          name: 'quantity'
        }]
      }
    }
    expect(actualIntakeResult).toEqual(expectedIntakeResult) // Test

    // FillSlot Stage
    const actualValidateResult: ValidateSlotsResult = validateSlots(abilities, actualIntakeResult)
    const expectedValidateResult: ValidateSlotsResult = {
      pendingWolfState: {
        activeAbility: 'addOrder',
        abilityCompleted: false,
        waitingFor: { slotName: null, turnCount: 0 },
        messageQueue: [],
        pendingData: {}
      },
      validateResult: {
        intent: 'addOrder',
        entities: [{
          value: 'everything',
          string: 'everything',
          name: 'pizzaType'
        }, {
          value: 'S',
          string: 'S',
          name: 'pizzaSize'
        }, {
          value: '1',
          string: '1',
          name: 'quantity'
        }]
      }
    }
    expect(actualValidateResult).toEqual(expectedValidateResult) // Test

    const actualFillSlotResult: FillSlotsResult = fillSlots(abilities, actualValidateResult)
    const expectedFillSlotResult: FillSlotsResult = {
      activeAbility: 'addOrder',
      abilityCompleted: false,
      waitingFor: { slotName: null, turnCount: 0 },
      messageQueue: [
        {
          message: 'ok! type is set to everything.',
          type: MessageType.slotFillMessage,
          slotName: 'pizzaType'
        },
        {
          message: 'ok! size is set to S.',
          type: MessageType.slotFillMessage,
          slotName: 'pizzaSize'
        },
        {
          message: 'ok! quantity is set to 1.',
          type: MessageType.slotFillMessage,
          slotName: 'quantity'
        }
      ],
      pendingData: {
        addOrder: {
          pizzaType: 'everything',
          pizzaSize: 'S',
          quantity: '1'
        }
      }
    }
    expect(actualFillSlotResult).toEqual(expectedFillSlotResult) // Test

    // Evaluate Stage
    const actualEvaluateResult: EvaluateResult = evaluate(abilities, actualFillSlotResult)
    const expectedEvaluateResult: EvaluateResult =  {
      pendingWolfState: {
        activeAbility: 'addOrder',
        abilityCompleted: false,
        waitingFor: { slotName: null, turnCount: 0 },
        messageQueue: [
          {
            message: 'ok! type is set to everything.',
            type: MessageType.slotFillMessage,
            slotName: 'pizzaType'
          },
          {
            message: 'ok! size is set to S.',
            type: MessageType.slotFillMessage,
            slotName: 'pizzaSize'
          },
          {
            message: 'ok! quantity is set to 1.',
            type: MessageType.slotFillMessage,
            slotName: 'quantity'
          }
        ],
        pendingData: {
          addOrder: {
            pizzaType: 'everything',
            pizzaSize: 'S',
            quantity: '1'
          }
        }
      },
      name: 'addOrder',
      type: 'userAction'
    }
    expect(actualEvaluateResult).toEqual(expectedEvaluateResult) // Test

    // Action Stage
    const convoState: ConvoState = {}
    const actualActionResult: ActionResult = action(abilities, convoState, actualEvaluateResult)
    const expectedActionResult: ActionResult = {
      pendingWolfState: {
        activeAbility: '',
        abilityCompleted: true,
        waitingFor: { slotName: null, turnCount: 0 },
        messageQueue: [
          {
            message: 'ok! type is set to everything.',
            type: MessageType.slotFillMessage,
            slotName: 'pizzaType'
          },
          {
            message: 'ok! size is set to S.',
            type: MessageType.slotFillMessage,
            slotName: 'pizzaSize'
          },
          {
            message: 'ok! quantity is set to 1.',
            type: MessageType.slotFillMessage,
            slotName: 'quantity'
          }
        ],
        pendingData: {
          addOrder: undefined
        }
      },
      runOnComplete: () => Promise.resolve('Your pizza order is added!')
    }

    expect(JSON.stringify(actualActionResult)).toEqual(JSON.stringify(expectedActionResult)) // Test

    // addMessageToQueue
    const ackMessage = await actualActionResult.runOnComplete()

    let updatedActionResult = actualActionResult
    if (typeof ackMessage === 'string') {
      updatedActionResult.pendingWolfState = addMessageToQueue(actualActionResult.pendingWolfState, ackMessage)
    }
    expect(updatedActionResult.pendingWolfState.messageQueue).toEqual([
      {
        message: 'ok! type is set to everything.',
        type: MessageType.slotFillMessage,
        slotName: 'pizzaType'
      },
      {
        message: 'ok! size is set to S.',
        type: MessageType.slotFillMessage,
        slotName: 'pizzaSize'
      },
      {
        message: 'ok! quantity is set to 1.',
        type: MessageType.slotFillMessage,
        slotName: 'quantity'
      },
      {
        message: 'Your pizza order is added!',
        type: MessageType.abilityCompleteMessage
      }
    ])

    // Outtake Stage
    const actualOuttakeResult: OuttakeResult = outtake(convoState, updatedActionResult.pendingWolfState)
    const expectedOuttakeResult: OuttakeResult = {
      messageStringArray: [
        'ok! type is set to everything., ok! size is set to S., ok! quantity is set to 1.',
        'Your pizza order is added!'
      ],
      messageItemArray: [
        {
          message: 'ok! type is set to everything.',
          type: MessageType.slotFillMessage,
          slotName: 'pizzaType',
        },
        {
          message: 'ok! size is set to S.',
          type: MessageType.slotFillMessage,
          slotName: 'pizzaSize',
        },
        {
          message: 'ok! quantity is set to 1.',
          type: MessageType.slotFillMessage,
          slotName: 'quantity',
        },
        {
          message: 'Your pizza order is added!',
          type: MessageType.abilityCompleteMessage,
          slotName: undefined
        }
      ],
      messageActivityArray: [
        {
          type: 'message',
          text: 'ok! type is set to everything., ok! size is set to S., ok! quantity is set to 1.'
        },
        {
          type: 'message',
          text: 'Your pizza order is added!'
        }
      ]
    }
    expect(actualOuttakeResult).toEqual(expectedOuttakeResult)
  })
})
