/* global test */
import intake, { NlpResult, IntakeResult } from '../stages/intake'
import { WolfState, Ability } from '../types';
import { randomElement } from '../helpers'
import evaluate, { EvaluateResult } from '../stages/evaluate';
import { ValidateSlotsResult, validateSlots } from '../stages/fillSlot';

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
          if (value.toLowerCase() === 'anchovy' || value.toLowerCase() === 'pineapple') {
            return { valid: false, reason: `${value} is not a good pizza.`}
          }
          return { valid: true, reason: null }
        },
        onFill: (value) => `ok! pizza is set to ${value}.`
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
          if (!value.toLowerCase().endsWith('L') && !value.toLowerCase().endsWith('S')) {
            return {
              valid: false,
              reason: 'Needs to set L or S',
            }
          }
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
          if (valid) {
            return {
              valid: true                                                                      
            }
          }
          return {
            valid: false,
            reason: 'not a number'                                                
          }
        }
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
        name: 'pizza',
        type: 'string',
        query: () => {
          return 'What is the name of the alarm you would like to remove?'
        }
      }
    ],
    onComplete: ({ getSubmittedData, getConvoState }) => {
      const convoState = getConvoState()
      const { alarmName } = getSubmittedData()
      const stateAlarms = convoState.alarms || []

      // Check if alarm name exists
      if (!stateAlarms.some((alarm) => alarm.alarmName === alarmName)) {
        return `There is no alarm with name ${alarmName}`
      }

      // Remove alarm
      const alarms = stateAlarms.filter(alarm => alarm.alarmName !== alarmName)
      convoState.alarms = alarms
      return `The ${alarmName} has been removed`                                                
    }
  },
  {
    name: 'listOrders',
    slots: [],
    onComplete: ({ getConvoState }) => {
      const convoState = getConvoState()
      const alarms = convoState.alarms || []

      if (alarms.length === 0) {
        return `You do not have any alarms!`
      }
      return alarms.map(alarms => alarms.alarmName + ' at ' + alarms.alarmTime).join(', ')
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
]

describe('Add a Pizza a cart', () => { // Feature (ability)
  it('can receive order (all correct inputs)', () => { // Test Scenario
    // NLP
    const nlpResult: NlpResult = {
      intent: 'addOrder',
      entities: [{
        value: 'everything',
        string: 'everything',
        name: 'pizzaType'
      }, {
        value: 'small',
        string: 'small',
        name: 'pizzaSize'
      }, {
        value: '1',
        string: '1',
        name: 'quantity'
      }]
    }
    const userMessage = 'add 1 small everything pizza to order'
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
          value: 'small',
          string: 'small',
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
    const validateResults: ValidateSlotsResult = validateSlots(abilities, actualIntakeResult)
    // Evaluate Stage
    // Action Stage
    // Outtake Stage

  })
  it('can retry order with run type')
})

test('Intake Stage with default Ability', () => {
  const wolfState: WolfState = initialWolfState

  const nlpResult: NlpResult = {
    intent: '',
    entities: []
  } 

  const userMessage = 'hi'
  const defaultAbility = 'help'

  let intakeResult: IntakeResult = intake(wolfState, nlpResult, userMessage, defaultAbility)
  
  expect(intakeResult).toEqual({
    nlpResult: nlpResult,
    pendingWolfState: {
      abilityCompleted: false,
      activeAbility: defaultAbility, // default abilityName
      waitingFor: {
        slotName: null,
        turnCount: 0
      },
      messageQueue: [],
      pendingData: {}
    }
  })
})

test('Intake Stage with detected NLP result', () => {
  const wolfState: WolfState = initialWolfState
  const nlpResult: NlpResult = {
    intent: 'orderPizza',
    entities: [
      {
        name: 'size',
        value: 'L',
        string: 'large'
      }
    ]
  }
  const userMessage = 'I want to order a large pizza'
  const defaultAbility = 'help'

  let intakeResult: IntakeResult = intake(wolfState, nlpResult, userMessage, defaultAbility)

  expect(intakeResult).toEqual({
    nlpResult: nlpResult,
    pendingWolfState: {
      abilityCompleted: false,
      activeAbility: 'orderPizza', // default abilityName
      waitingFor: {
        slotName: null,
        turnCount: 0
      },
      messageQueue: [],
      pendingData: {}
    }
  })
})