import { Ability } from '../../../types'

export interface UserConvoState {
  car: string | null,
  addons: string[]
}

export default [{
  name: 'buyCar',
  slots: [{
    name: 'car',
    query: () => 'what kind of car would you like?'
  }],
  nextAbility: () => ({abilityName: 'buyAddOn'}),
  onComplete: (convoState, submittedData) => {
    convoState.car = submittedData.car
  }
}, {
  name: 'buyAddOn',
  slots: [{
    name: 'addOn',
    query: () => 'What add on would you like?'
  }],
  onComplete: (convoState, submittedData) => {
    if (submittedData.addOn !== 'nothing') {
      convoState.addons.push(submittedData.addOn)
    }
  }
}] as Ability<UserConvoState>[]
