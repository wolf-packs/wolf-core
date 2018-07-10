/* global describe it test expect */
import { FillSlotsResult } from '../stages/fillSlot'
import evaluate, { EvaluateResult } from '../stages/evaluate'
import { Ability, MessageType, AbilityFunctionMap, AbilityFunction } from '../types'

interface Pizza {
  kind: string,
  size: string
}

test('Evaluate Stage with Initial Wolf State (starting ability)', () => {
  const abilities: Ability[] = [{
      name: 'orderPizza',
      slots: [{
        name: 'size',
        query: 'What size would you like?',
        type: 'string',
        acknowledge: (value) => `ok! your pizza size is set to ${value}`
      }, {
        name: 'kind',
        query: 'What kind of result would you like?',
        type: 'string'
      }]
  }]

  const fillSlotsResult: FillSlotsResult = {
    abilityCompleted: false,
    activeAbility: 'orderPizza', // default abilityName
    waitingFor: {
      slotName: null,
      turnCount: 0
    },
    messageQueue: [{
      message:  'ok! your pizza size is set to L',
      slotName: 'size',
      type: MessageType.slotFillMessage,
    }],
    pendingData: {
      orderPizza: {
        size: 'L',
      }
    }
  }

  const orderPizzaAbility: AbilityFunction = {
    props: {
      name: 'cart'
    },
    submit: <Pizza>(prev: Pizza[], value: Pizza): Pizza[] => {
      return [
        ...prev,
        value
      ]
    },
    acknowledge: (value: Pizza) => {
      return 'your pizza is added to the cart'
    }
  }

  const funcs: AbilityFunctionMap = {
    orderPizza: orderPizzaAbility
  }
  
  const result: EvaluateResult = evaluate(abilities, funcs, fillSlotsResult)

  expect(result).toEqual({
    name: 'kind',
    type: 'slot',
    pendingWolfState: {
      abilityCompleted: false,
      activeAbility: 'orderPizza',
      messageQueue: [
        {
          'message': 'ok! your pizza size is set to L',
          'slotName': 'size',
          'type': 3,
        },
      ],
      pendingData: {
        orderPizza: {
          size: 'L',
        },
      },
      waitingFor: {
        slotName: null,
        turnCount: 0,
      },
    }
  })
})
