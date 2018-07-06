# Botbuilder Wolf
Wolf was created to integrate seamlessly with [Microsoft Bot Framework v4](https://github.com/Microsoft/botbuilder-js).
___

## Purpose
Developing intelligent chatbots often lead to complex dialog trees which results in prompting the user for many pieces of information. Most frameworks require you to keep track of the state yourself as well as hard-coding static dialog flows to gather these pieces of information. Development often turns into creating a complex state machine where you must check the current state to determine which prompt the chatbot should issue next.

Wolf aims to provide a highly flexible and convenient framework for enabling state driven dynamic prompt flow. Simply define all the `slots` to be filled (information required from the user, prompts to issue, and actions to take after the information is fulfilled) and Wolf will handle the rest to ensure all information is collected. `Slot` can be defined as dependencies on other `slots` if desired.

All functions from `botbuilder-wolf` are pure functions.
___

## Concepts
__*Slot*__: A slot is structure that represents any piece of information that is required from the user and obtained through conversation or a system. This can be the user's name, address, etc.. A slot structure has a few properties which allows Wolf to dynamically search for possible matches. Anatomy of a slot:
- `entity`: name of slot.
- `type`: value type.
- `query`: string to prompt user to obtain information.
- `retryQuery`: string(s) to prompt user if validator does not pass.
- `validate`: function to test if the information is valid before fulfilling.
- `acknowledge`: function that returns string to present to user on slot fulfill.

Here is an example of a slot:
```js
entity: 'alarmName',
type: 'string',
query: 'What is the name of the alarm?',
retryQuery: (turnCount) => {
  // array of retry phrases to send to user
  const phrase = ['Please try a new name (attempt: 2)', 'Try harder.. (attempt: 3)']
  if (turnCount > phrase.length - 1) {
    return phrase[phrase.length - 1]
  }
  return phrase[turnCount]
},
validate: (value) => {
  // validator that must pass before slot is fulfilled
  if (value.toLowerCase() === 'wolf') {
    return { valid: false, reason: `${value} can not be used.`}
  }
  return { valid: true, reason: null }
},
acknowledge: (value) => `ok! name is set to ${value}.`
```

__*Fulfilling Slots*__: On every turn, Wolf will check if the user input can possibly fulfill any slots in a 'pending' state. This check is done using NLP (*Natural Language Processing*) and user defined criteria and test functions. If a slot is identified as a match, the slot state will change from 'pending' to 'fulfilled' and the slot action will run, such as storing the value to the state.
___
## Wolf Stages:
### **Intake**
`Intake` determines which ability is being "focused on" this turn based on the previous wolf state and the nlp result of the current user message.

### **FillSlot**
`FillSlot` Stage validates and fills the slot(s) based on the user message in the ability determined by `intake`. If there is any information that is invalid, the bot will attempt to retry

### **Evaluate**
`Evaluate` looks for the next slot to ask for the user if there is any slots that is not filled.  If all slots are filled, `Evalutes` marks the ability "complete".

### **Action**
`Action` inspects the result of the `Evaluate`, and takes the appropriate action.  If there are missing slots, 

### **Outtake**
TODO
___
## How to use
### Install
Open a pre-existing Microosft Bot Framework v4 project directory and run:
```
npm install botbuilder-wolf
```

### Wolf Middleware
```
TODO
```

### Call Wolf
```
TODO
```

___

## Contribution
Please refer to [Wolf Wiki](https://github.com/great-lakes/botbuilder-wolf/wiki) for roadmap and contribution information.
