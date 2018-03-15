import abilityList from '../abilities'

export const submit = (prev = []) => {
  return prev
}

export const acknowledge = () => {
  const abilities = abilityList.map((ability) => ability.name).join(', ')
  const message = 'Here are my abilities: '
  return message + abilities
}