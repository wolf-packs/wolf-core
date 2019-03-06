import * as findHelpers from '../../../../src/helpers/find'
import { Ability, AllSyncStorageLayer, SlotId } from '../../../types';

interface MockUserState {
    firstName: string,
    lastName: SVGAnimatedString,
    age: number
}

describe('findIndexofSlotIdsBySlotId function', () => {
    test('when SlotID does not exist', () => {
        const abilities: Ability<MockUserState, AllSyncStorageLayer<MockUserState>>[] = [{
            name: 'ability1',
            traces: [{ slotName: 'slot1' }, { slotName: 'slot3' }],
            onComplete: () => { return }
        }, {
            name: 'ability2',
            traces: [{ slotName: 'slot2' }],
            onComplete: () => { return }
        }, {
            name: 'ability3',
            traces: [{ slotName: 'slot1' }],
            onComplete: () => { return }
        }]

        const slotIds: SlotId[] = [{
            slotName: 'slot1',
            abilityName: 'ability1'
        },
        {
            slotName: 'slot3',
            abilityName: 'ability1'
        },
        {
            slotName: 'slot2',
            abilityName: 'ability2'
        },
        {
            slotName: 'slot1',
            abilityName: 'ability3'
        }]
        const singleSlotId: SlotId = {
            slotName: 'slot1',
            abilityName: 'ability4'
        }

        const actual = findHelpers.findIndexOfSlotIdsBySlotId(slotIds, singleSlotId)
        expect(actual).toEqual(-1)
        //expect(() => findHelpers.findIndexOfSlotIdsBySlotId(slotIds, singleSlotId)).toThrow()
    })

    test('when SlotID does exist', () => {
        const abilities: Ability<MockUserState, AllSyncStorageLayer<MockUserState>>[] = [{
            name: 'ability1',
            traces: [{ slotName: 'slot1' }, { slotName: 'slot3' }],
            onComplete: () => { return }
        }, {
            name: 'ability2',
            traces: [{ slotName: 'slot2' }],
            onComplete: () => { return }
        }, {
            name: 'ability3',
            traces: [{ slotName: 'slot1' }],
            onComplete: () => { return }
        }]

        const slotIds: SlotId[] = [{
            slotName: 'slot1',
            abilityName: 'ability1'
        },
        {
            slotName: 'slot3',
            abilityName: 'ability1'
        },
        {
            slotName: 'slot2',
            abilityName: 'ability2'
        },
        {
            slotName: 'slot1',
            abilityName: 'ability3'
        }]
        
        const singleSlotId: SlotId = {
            slotName: 'slot1',
            abilityName: 'ability3'
        }

        const actual = findHelpers.findIndexOfSlotIdsBySlotId(slotIds, singleSlotId)
       expect(actual).toEqual(3)

    })
})

describe('findInSlotIdItemBySlotId function', () => {
    test('when SlotID does not exist', () => {
        const abilities: Ability<MockUserState, AllSyncStorageLayer<MockUserState>>[] = [{
            name: 'ability1',
            traces: [{ slotName: 'slot1' }, { slotName: 'slot3' }],
            onComplete: () => { return }
        }, {
            name: 'ability2',
            traces: [{ slotName: 'slot2' }],
            onComplete: () => { return }
        }, {
            name: 'ability3',
            traces: [{ slotName: 'slot1' }],
            onComplete: () => { return }
        }]

        const slotIds: SlotId[] = [{
            slotName: 'slot1',
            abilityName: 'ability1'
        },
        {
            slotName: 'slot3',
            abilityName: 'ability1'
        },
        {
            slotName: 'slot2',
            abilityName: 'ability2'
        },
        {
            slotName: 'slot1',
            abilityName: 'ability3'
        }]
        const singleSlotId: SlotId = {
            slotName: 'slot1',
            abilityName: 'ability4'
        }

        const actual = findHelpers.findInSlotIdItemBySlotId(slotIds, singleSlotId)
        expect(actual).toEqual(undefined)
    })

    test('when SlotID does exist', () => {
        const abilities: Ability<MockUserState, AllSyncStorageLayer<MockUserState>>[] = [{
            name: 'ability1',
            traces: [{ slotName: 'slot1' }, { slotName: 'slot3' }],
            onComplete: () => { return }
        }, {
            name: 'ability2',
            traces: [{ slotName: 'slot2' }],
            onComplete: () => { return }
        }, {
            name: 'ability3',
            traces: [{ slotName: 'slot1' }],
            onComplete: () => { return }
        }]

        const slotIds: SlotId[] = [{
            slotName: 'slot1',
            abilityName: 'ability1'
        },
        {
            slotName: 'slot3',
            abilityName: 'ability1'
        },
        {
            slotName: 'slot2',
            abilityName: 'ability2'
        },
        {
            slotName: 'slot1',
            abilityName: 'ability3'
        }]
        
        const singleSlotId: SlotId = {
            slotName: 'slot1',
            abilityName: 'ability3'
        }

        const actual = findHelpers.findInSlotIdItemBySlotId(slotIds, singleSlotId)
        expect(actual).toEqual({ slotName: 'slot1', abilityName: 'ability3' })

    })
})
