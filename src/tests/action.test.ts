/* global describe it test expect */
import { EvaluateResult } from '../stages/evaluate'
import action, { ActionResult } from '../stages/action'
import { Ability, MessageType, AbilityFunctionMap, AbilityFunction } from '../types'

interface Pizza {
  kind: string,
  size: string
}

test('FillSlot Stage with Initial Wolf State (starting ability)', () => {
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

  const evaluateResult: EvaluateResult = {
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

  const convoState = {cart: []}
  
  const result: ActionResult = action(abilities, funcs, {cart: []}, evaluateResult)

  expect(result).toEqual({
    abilityCompleted: false,
    activeAbility: 'orderPizza',
    messageQueue: [
      {
        message: 'ok! your pizza size is set to L',
        slotName: 'size',
        type: 3,
      },
      {
        message: 'What kind of result would you like?',
        slotName: 'kind',
        type: 2,
      },
    ],
    pendingData: {
      orderPizza: {
        size: 'L',
      },
    },
    waitingFor: {
      slotName: 'kind',
      turnCount: 0,
    }
  })
})
