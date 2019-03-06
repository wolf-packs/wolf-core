import * as arrayHelpers from '../../../../src/helpers/array'
import { Ability, AllSyncStorageLayer, SlotId } from '../../../types';

interface MockUserState {
    firstName: string,
    lastName: SVGAnimatedString,
    age: number
}

describe('changeArrayItemOnIndex function', () => {
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
        ]

        expect(() => arrayHelpers.changeArrayItemOnIndex(slotIds, 3, { slotName: slotIds[3].slotName, abilityName: 'ability1' })).toThrowError()
        //console.log(actual)
        //expect(actual).toEqual(-1)
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
            abilityName: 'ability3'
        },
        {
            slotName: 'slot3',
            abilityName: 'ability1'
        },
        ]

        const actual = arrayHelpers.changeArrayItemOnIndex(slotIds, 0, { slotName: slotIds[0].slotName, abilityName: 'ability2' })
        expect(actual).toEqual(
            [{ slotName: 'slot1', abilityName: 'ability2' },
            { slotName: 'slot3', abilityName: 'ability1' }]
        )

    })
})

describe('removeSlotFromSlotIdArray function', () => {
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
        ]

        const singleSlotId: SlotId = {
            slotName: 'slot4',
            abilityName: 'ability2'
        }

        const actual = arrayHelpers.removeSlotFromSlotIdArray(slotIds, singleSlotId)
        expect(actual).toEqual(slotIds)
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
            abilityName: 'ability3'
        },
        {
            slotName: 'slot3',
            abilityName: 'ability1'
        },
        ]

        const singleSlotId: SlotId = {
            slotName: 'slot1',
            abilityName: 'ability3'
        }

        const actual = arrayHelpers.removeSlotFromSlotIdArray(slotIds, singleSlotId)
        expect(actual).toEqual(
            [{ slotName: 'slot3', abilityName: 'ability1' }]
        )

    })
})