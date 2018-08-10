# Botbuilder Wolf
Wolf was created to integrate seamlessly with [Microsoft Bot Framework v4](https://github.com/Microsoft/botbuilder-js).

Wolf aims to allows the user to dynamically change the behavior of the bot with one configuration point. The configuration point is hot-loadable, allowing the owner of the bot to change the bot behavior while it is still running. Botbuilder Wolf facilitates information gathering, either by asking a question or accepting a piece of information parsed by NLP.  The library is also an abstraction layer that ensures stability, which means if the Botbuilder SDKv4 interface changes, the configuration can stay the same.

_Please see [Roadmap](https://github.com/great-lakes/botbuilder-wolf/wiki/Roadmap) for more details and planned features. If you do not see a feature, please feel free to open an issue._
___

## Purpose
Developing intelligent chatbots often lead to complex dialog trees which results in prompting the user for many pieces of information. Most frameworks require you to keep track of the state yourself as well as hard-coding static dialog flows to gather these pieces of information. Development often turns into creating a complex state machine where you must check the current state to determine which prompt the chatbot should issue next.

Wolf aims to provide a highly flexible and convenient framework for enabling state driven dynamic prompt flow. Simply define all the `slots` to be filled (information required from the user, prompts to issue, and actions to take after the information is fulfilled) and Wolf will handle the rest to ensure all information is collected. `Slot` can be defined as dependencies on other `slots` if desired. A collection of `slots` are grouped by `abilities` which also can have dependencies on another to help drive dynamic conversation flow.

All functions from `botbuilder-wolf` are pure functions.
___

## Bring Your Own Natural Language Processing.. BYONLP
This library takes the guesswork out of complex conversation flows, and allows you to declaritively define your slots.  However, it does not parse user intent or entities for you.  Wolf takes in the result of NLP (which can be as simple as regex or as complex as a tensorflow-backed model), and determines the next slot or ability to complete.

In order for Wolf to accept your NLP, the result to follow a specific object shape. This shape is typed as `NlpResult`, and it is as follows:
```js
{
  intent: string,
  entities: [
    {
      value: any,     // normalized value
      text: string,   // raw value
      name: string    // entity name (should match slot name)
    }    
  ]  
}
```
_Please note: NLP entity name should match slot name for Wolf to detect matches!_
___

## Ability Structure
__*Slot*__: A slot is structure that represents any piece of information that is required from the user and obtained through conversation or a system. This can be the user's name, address, etc.. A slot structure has a few properties which allows Wolf to dynamically search for possible matches. Anatomy of a slot:
- `name`: name of slot. **should match an entity name from your NLP**
- `order`: optimal order to fill slot. (ascending order)
- `query`: string to prompt user to obtain information.
- `validate`: function to test if the information is valid before fulfilling.
- `retry`: string(s) to prompt user if validator does not pass.
- `onFill`: function that returns string to present to user on slot fulfill.

Here is an example of a slot from the alarm example:
```js
name: 'alarmName',
query: () => { return 'What is the name of the alarm?'},
retry: (turnCount) => {
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
onFill: (value) => `ok! name is set to ${value}.`
```

__*Ability*__: An ability is a logical unit that contains a collection of slots and runs a function when the slots are filled.  An ability also has other features like kicking off another ability once it is completed

- `name`: name of the ability **should match an intent name from your NLP**
- `slots`: collection of Slots
- `nextAbility?`: a function that specifies the next ability to kick off and a message to let the user know.
- `onComplete`: function (sync or asynchronous) that runs upon all slots being filled.

Here is an example of an ability from the alarm example:
```js
name: 'addAlarm',
    slots: [
      // .. see `alarmName` slot example above
    ],
    onComplete: (convoState, submittedData) => {
      return new Promise((resolve, reject) => {
        const value = submittedData
        const alarms = convoState.alarms || []
        // add alarm to convoState
        convoState.alarms = [
          ...alarms,
          value          
        ]                                             
        
        // demonstrate async supported
        setTimeout(() => {
          resolve(`Your ${value.alarmName} alarm is added!`)
        }, 2000)
      })
    }
```

___
## Install
Open a pre-existing Microsft Bot Framework v4 project directory and run:
```
npm install botbuilder-wolf
```

## How to Use
1. Install `botbuilder-wolf`.
2. Import Wolf into a pre-existing Microsft Bot Framework v4 bot.
```js
import { wolfMiddleware, getMessages, createWolfStore, IncomingSlotData } from 'botbuilder-wolf'
```

3. Create an abilities definition 
(see example [alarmBot abilities](https://github.com/great-lakes/botbuilder-wolf/blob/master/examples/alarmBot/abilities.ts))
4. Import the abilities definition
```js
import abilities from './abilities'
```

3. Setup the Wolf middleware
```js
// Wolf middleware
adapter.use(...wolfMiddleware(
  conversationState,
  (context) => nlp(context.activity.text),
  (context) => abilities,
  'listAbility',
  createWolfStore()
))
```

4. Handle the output messages in the `server.post`
```js
server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    try {
      if (context.activity.type !== 'message') {
        return
      }
      const messages = getMessages(context) // retrieve output messages from Wolf
      await context.sendActivities(messages.messageActivityArray) // send messages to user
    } catch (err) {
      console.error(err.stack)
    }
  })
})
```

___
## Resources

See [Wolf Core Concepts](https://github.com/great-lakes/botbuilder-wolf/wiki/Core-Concepts) for more information about middleware usage.

See [examples](https://github.com/great-lakes/botbuilder-wolf/tree/master/examples) for full implementation.

___
## Contribution
Please refer to [Wolf Wiki](https://github.com/great-lakes/botbuilder-wolf/wiki) for roadmap and contribution information.
