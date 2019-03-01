import * as abilityHelpers from '../../../../src/helpers/ability'
import { AllSyncStorageLayer, Ability, Slot } from '../../../types';

interface MockUserState {
  firstName: string,
  lastName: string,
  age: number
}

describe('doesAbilityHasSlots function', () => {
  test('when ability has no slots', () => {
    const ability: Ability<MockUserState, AllSyncStorageLayer<MockUserState>> = {
      name: 'ability1',
      traces: [],
      onComplete: () => { return }
    }

    const actual = abilityHelpers.doesAbilityHaveSlots(ability)
    expect(actual).toEqual(false)
  })

  test('when ability has one slots', () => {
    const ability: Ability<MockUserState, AllSyncStorageLayer<MockUserState>> = {
      name: 'ability1',
      traces: [{ slotName: 'slot1' }],
      onComplete: () => { return }
    }

    const actual = abilityHelpers.doesAbilityHaveSlots(ability)
    expect(actual).toEqual(true)
  })

  test('when ability has many slots', () => {
    const ability: Ability<MockUserState, AllSyncStorageLayer<MockUserState>> = {
      name: 'ability1',
      traces: [{ slotName: 'slot1' }, { slotName: 'slot2' }],
      onComplete: () => { return }
    }

    const actual = abilityHelpers.doesAbilityHaveSlots(ability)
    expect(actual).toEqual(true)
  })
})

describe('getAbilitySlots', () => {
  test('when ability has no slots associated', () => {
    const slots: Slot<AllSyncStorageLayer<MockUserState>>[] = [{
      name: 'slot1',
      query: () => { return 'What is your slot1?' }
    }, {
      name: 'slot2',
      query: () => { return 'what is your slot2?' }
    }, {
      name: 'slot3',
      query: () => { return 'what is your slot3?' }
    }]

    const ability: Ability<MockUserState, AllSyncStorageLayer<MockUserState>> = {
      name: 'ability1',
      traces: [],
      onComplete: () => { return }
    }

    const actual = abilityHelpers.getAbilitySlots(slots, ability)
    expect(actual).toEqual([])
  })

  test('when ability has misspelled trace.slotName, an error is thrown', () => {
    const slots: Slot<AllSyncStorageLayer<MockUserState>>[] = [{
      name: 'slot1',
      query: () => { return 'What is your slot1?' }
    }, {
      name: 'slot2',
      query: () => { return 'what is your slot2?' }
    }, {
      name: 'slot3',
      query: () => { return 'what is your slot3?' }
    }]

    const ability: Ability<MockUserState, AllSyncStorageLayer<MockUserState>> = {
      name: 'ability1',
      traces: [{ slotName: 'mispellSlot1' }],
      onComplete: () => { return }
    }

    expect(() => abilityHelpers.getAbilitySlots(slots, ability)).toThrow()
  })

  test('when a slot has a misspelled name, an error is thrown', () => {
    const slots: Slot<AllSyncStorageLayer<MockUserState>>[] = [{
      name: 'misspelled',
      query: () => { return 'What is your slot1?' }
    }, {
      name: 'slot2',
      query: () => { return 'what is your slot2?' }
    }, {
      name: 'slot3',
      query: () => { return 'what is your slot3?' }
    }]

    const ability: Ability<MockUserState, AllSyncStorageLayer<MockUserState>> = {
      name: 'ability1',
      traces: [{ slotName: 'slot1' }],
      onComplete: () => { return }
    }

    expect(() => abilityHelpers.getAbilitySlots(slots, ability)).toThrow()
  })

  test('when ability has slots and can get the slots', () => {
    const slots: Slot<AllSyncStorageLayer<MockUserState>>[] = [{
      name: 'slot1',
      query: () => { return 'What is your slot1?' }
    }, {
      name: 'slot2',
      query: () => { return 'what is your slot2?' }
    }, {
      name: 'slot3',
      query: () => { return 'what is your slot3?' }
    }]

    const ability: Ability<MockUserState, AllSyncStorageLayer<MockUserState>> = {
      name: 'ability1',
      traces: [{ slotName: 'slot1' }, { slotName: 'slot2' }],
      onComplete: () => { return }
    }

    const expectedSlots = [slots[0], slots[1]]

    const actual = abilityHelpers.getAbilitySlots(slots, ability)
    expect(actual).toEqual(expectedSlots)
  })
})

describe('getAbilityByName', () => {
  test('when ability name is not in the abilities, thrown an error', () => {
    const abilities: Ability<MockUserState, AllSyncStorageLayer<MockUserState>>[] = [{
      name: 'ability1',
      traces: [],
      onComplete: () => { return }
    }, {
      name: 'ability2',
      traces: [],
      onComplete: () => { return }
    }]

    expect(() => abilityHelpers.getAbilityByName(abilities, 'what')).toThrow()
  })

  test('can find ability', () => {
    const abilities: Ability<MockUserState, AllSyncStorageLayer<MockUserState>>[] = [{
      name: 'ability1',
      traces: [],
      onComplete: () => { return }
    }, {
      name: 'ability2',
      traces: [],
      onComplete: () => { return }
    }]

    const actual = abilityHelpers.getAbilityByName(abilities, 'ability2')
    expect(actual).toEqual(abilities[1])
  })
})