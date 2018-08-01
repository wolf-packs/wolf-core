import { NlpEntity, NlpResult } from '../../src/types'

type recognizer = (input: string) => NlpEntity | null

const addAlarmTester = new RegExp('add')
const listAlarmsTester = new RegExp('list')
const removeAlarmTester = new RegExp('remove')
const listAbilitiesTester = new RegExp('what')

const testers = [
  {
    name: 'addAlarm',
    tester: (input) => {
      return addAlarmTester.test(input)
    }
  },
  {
    name: 'listAlarms',
    tester: (input) => {
      return listAlarmsTester.test(input)
    }
  },
  {
    name: 'removeAlarm',
    tester: (input) => {
      return removeAlarmTester.test(input)
    }
  },
  {
    name: 'listAbilities',
    tester: (input) => {
      return listAbilitiesTester.test(input)
    }
  }
]

const recognizers: recognizer[] = [
  (input: string) => {
    const nameReg = /called (\w*)/
    const result = nameReg.exec(input)
    if (!result) {
      return null
    }
    return {
      name: 'alarmName',
      value: result[1],
      text: result[1]
    }
  }
  ,
  (input: string) => {
    const timeReg = /at (\d\s?(am|pm))/
    const result = timeReg.exec(input)
    if (!result) {
      return null
    }
    return {
      name: 'alarmTime',
      value: result[1],
      text: result[1]
    }
  }
]

function nlp(input: string): NlpResult {
  const found = {...testers.find((tester) => tester.tester(input))}
  if (!found) {
    return {
      message: input,
      intent: null,
      entities: []
    }
  }
  const {name: intent} = found

  const entities = recognizers
    .map(rec => rec(input))
    .filter(_ => _)
  
  return {
    message: input,
    intent,
    entities
  }
}

// "add alarm at 8am" => {intent: "addAlarm", entities: [{name: "alarmTime", value: "8am"}]}

export default nlp