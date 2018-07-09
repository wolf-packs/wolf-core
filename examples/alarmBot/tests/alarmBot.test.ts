/* global describe, it, expect */

import nlp from '../nlp'

describe('nlp', () => {
  it('can detect intent and full set of entities', () => {
    const result = nlp('add alarm called kevin at 8am')
    const expectedIntent = 'addAlarm'
    const expectedEntities = [{
      name: 'alarmName',
      value: 'kevin'
    }, {
      name: 'alarmTime',
      value: '8am'
    }]
    expect(result.intent).toBe('addAlarm')
    expect(Object.keys(result.entities[0]))
      .toEqual(['entity', 'value', 'string'])
    expect(result.entities.map(_ => ({
      name: _.entity,
      value: _.value
    }))).toEqual(expectedEntities)

    const result2 = nlp('add alarm called hao at 9am')
    const expectedIntent2 = 'addAlarm'
    const expectedEntities2 = [{
      name: 'alarmName',
      value: 'hao'
    }, {
      name: 'alarmTime',
      value: '9am'
    }]
    expect(result2.intent).toBe('addAlarm')
    expect(Object.keys(result2.entities[0]))
      .toEqual(['entity', 'value', 'string'])
    expect(result2.entities.map(_ => ({
      name: _.entity,
      value: _.value
    }))).toEqual(expectedEntities2)
  })
})
