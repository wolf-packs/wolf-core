# Wolf Core
🐺 Declarative development for state driven dynamic prompt flow.

[![npm version](https://badge.fury.io/js/wolf-core.svg)](https://badge.fury.io/js/wolf-core) [![Build Status](https://travis-ci.org/wolf-packs/wolf-core.svg?branch=master)](https://travis-ci.org/wolf-packs/wolf-core)

Wolf allows you, the developer, to define a bot conversation with ease. There is one configuration point, which is hot-loadable, enabling you to change the bot behavior while the node process is still running. Wolf facilitates information gathering, either by asking a question or accepting a piece of information parsed by NLU. Wolf achieves this abstraction with three concepts: Abilities, Slots and Traces. All concepts rely on user defined functions, so the developer has full control on the processes that run.

_See Purpose section below for more information._

# Guiding Principles:
* **Declarative:** You specify **what** you want (abilities and slots), and **what** to do after you have the information. Wolf will figure out **how** to get the information and complete the ability for you.
* **Stateless:** Wolf stages are stateless meaning that the data is passed in on every function invocation, making hot-
 possible, and testing extremely easy.
* **Functional:** Wolf stages are pure functions.  Side-effects are allowed but is defined and managed by you, the user.
* **Framework Agnostic:** Wolf Core is framework agnostic, making it easy to integrate with backend services like express, Bot Framework, Dialogflow, etc.

# Getting Started
TODO

# Purpose
Developing intelligent chatbots often lead to complex dialog trees which results in prompting the user for many pieces of information. Most frameworks require you to keep track of the state yourself as well as hard-coding static dialog flows to gather these pieces of information. Development often turns into creating a complex state machine where you must check the current state to determine which prompt the chatbot should issue next.

Wolf aims to provide a highly flexible and convenient framework for enabling state driven dynamic prompt flow. Simply define all the `slots` to be filled (information required from the user, prompts to issue, and actions to take after the information is fulfilled) and Wolf will handle the rest to ensure all information is collected. `Slot` can be defined as dependencies on other `slots` if desired. A collection of `slots` have relationships to `abilities` which also can have dependencies on another to help drive dynamic conversation flow.

# Concepts
## BYONLU: Bring Your Own Natural Language Understanding
Wolf takes the guesswork out of complex conversation flows, and allows you to declaratively define your flow. However, it does not parse user intent or entities for you. Wolf takes in the result of NLU (which can be as simple as regex or as complex as a neural network models), and determines the next slot or ability to complete.

## Ability
An ability is a logical unit that contains a collection of relationships to slot(s) and runs a user defined function when all required slots are filled. An ability also has other features like kicking off another ability once it is completed to allow for more complex flows.

## Slot
A slot is structure that represents any piece of information that is required from the user and obtained through conversation or a system. This can be the user's name, address, etc.. A slot has a few properties which allows Wolf to dynamically search for possible matches including query, validate and retry.

## Trace


# Contribution
Any and all contributions are welcome! From reporting bugs, feature requests to code updates, please refer to [Wolf Wiki] for contribution information including "How to Contribute" and "Code of Conduct".

Please see the [Roadmap] for more details on planned features. If you do not see a feature, please feel free to open an issue.

[Roadmap]: https://github.com/wolf-packs/wolf-core/wiki/Roadmap
[Wolf Wiki]: https://github.com/wolf-packs/wolf-core/wiki
