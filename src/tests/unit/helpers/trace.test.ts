import * as traceHelpers from '../../../../src/helpers/trace'
import { Ability, AllSyncStorageLayer, SlotId } from '../../../types';

interface MockUserState {
  firstName: string,
  lastName: SVGAnimatedString,
  age: number
}

describe('getTraceBySlotId function', () => {
  test('when ability does not exist', () => {
    const abilities: Ability<MockUserState, AllSyncStorageLayer<MockUserState>>[] = [{
      name: 'ability1',
      traces: [],
      onComplete: () => { return }
    }, {
      name: 'ability2',
      traces: [],
      onComplete: () => { return }
    }, {
      name: 'ability3',
      traces: [],
      onComplete: () => { return }
    }]

    const slotId: SlotId = {
      slotName: 'slot1',
      abilityName: 'ability4'
    }

    // const actual = traceHelpers.getTraceBySlotId(abilities, slotId)
    expect(traceHelpers.getTraceBySlotId(abilities, slotId)).toThrowError(
      `Could not find ability with abilityName: ${slotId.abilityName} within abilities array`
    )
  })

  test('when slot does not exist on ability (trace does not exist)', () => {
    const abilities: Ability<MockUserState, AllSyncStorageLayer<MockUserState>>[] = [{
      name: 'ability1',
      traces: [{ slotName: 'slot3' }],
      onComplete: () => { return }
    }, {
      name: 'ability2',
      traces: [{ slotName: 'slot3' }],
      onComplete: () => { return }
    }, {
      name: 'ability3',
      traces: [{ slotName: 'slot1' }, { slotName: 'slot2' }],
      onComplete: () => { return }
    }]

    const slotId: SlotId = {
      slotName: 'slot3',
      abilityName: 'ability3'
    }

    const actual = traceHelpers.getTraceBySlotId(abilities, slotId)
    expect(actual).toThrowError(
      `Cannot find trace object. There is no slot called ${slotId.slotName} in the ${slotId.abilityName} ability`
    )
  })

  test('when ability has slot', () => {
    const abilities: Ability<MockUserState, AllSyncStorageLayer<MockUserState>>[] = [{
      name: 'ability1',
      traces: [{ slotName: 'slot3' }],
      onComplete: () => { return }
    }, {
      name: 'ability2',
      traces: [{ slotName: 'slot3' }],
      onComplete: () => { return }
    }, {
      name: 'ability3',
      traces: [{ slotName: 'slot1' }, { slotName: 'slot2' }, { slotName: 'slot3' }],
      onComplete: () => { return }
    }]

    const slotId: SlotId = {
      slotName: 'slot3',
      abilityName: 'ability3'
    }

    const actual = traceHelpers.getTraceBySlotId(abilities, slotId)
    expect(actual).toEqual(abilities[2].traces[2])
  })
})
