export default [
  {
    name: 'greet',
    slots: [
      {
        name: 'name',
        query: () => 'what is your name?'
      }
    ],
    onComplete: ({getSubmittedData}) => {
      const { name } = getSubmittedData()
      return `Oh! Hello ${name!}`
    }
  }
]
