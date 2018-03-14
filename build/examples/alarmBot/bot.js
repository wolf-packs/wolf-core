(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "botbuilder", "botbuilder-services", "./nlp", "./addAlarm", "./listAlarms", "./removeAlarm", "./slots", "./intents"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const botbuilder_1 = require("botbuilder");
    const botbuilder_services_1 = require("botbuilder-services");
    const nlp_1 = require("./nlp");
    const addAlarm = require("./addAlarm");
    const listAlarms = require("./listAlarms");
    const removeAlarm = require("./removeAlarm");
    const ksl = {
        addAlarm,
        listAlarms,
        removeAlarm
    };
    const slots_1 = require("./slots");
    const intents_1 = require("./intents");
    const get = require('lodash.get');
    const set = require('lodash.set');
    const difference = require('lodash.difference');
    const restify = require('restify');
    // Create server
    let server = restify.createServer();
    server.listen(process.env.port || 3978, () => {
        console.log(`${server.name} listening to ${server.url}`);
    });
    // Create connector
    const adapter = new botbuilder_services_1.BotFrameworkAdapter({ appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD });
    server.post('/api/messages', adapter.listen());
    // type Action = (result: NlpResult, state: WolfState, next: () => Action) => void
    function intake(wolfState, message) {
        let intakeResult;
        if (wolfState.waitingFor) {
            // set(wolfState.pendingData, wolfState.waitingFor, message ) // validator => extractor
            intakeResult = {
                intent: wolfState.currentIntent,
                entities: [
                    {
                        entity: wolfState.waitingFor,
                        value: message,
                        string: message
                    }
                ]
            };
            wolfState.waitingFor = null;
        }
        else {
            const nlpObj = nlp_1.default(message);
            if (!wolfState.currentIntent) {
                wolfState.currentIntent = nlpObj.intent;
            }
            intakeResult = nlpObj;
        }
        return intakeResult;
    }
    function getActions(wolfState, result) {
        const pendingPath = `pendingData.${result.intent}`;
        if (!get(wolfState, `pendingData.${result.intent}`)) {
            wolfState.pendingData[result.intent] = {};
        }
        return result.entities.map(entity => {
            const slotObj = slots_1.default.find((slot) => slot.entity === entity.entity);
            return () => {
                set(wolfState, `pendingData.${result.intent}.${entity.entity}`, entity.value);
                return slotObj.acknowledge(entity.value);
            };
        });
    }
    function runActions(reply, actions) {
        actions.forEach((action) => reply(action()));
    }
    function evaluate(convoState, wolfState) {
        // simplest non-graph implementation
        const { currentIntent, pendingData } = wolfState;
        const intentObj = intents_1.default.find((intent) => intent.name === currentIntent);
        const currentPendingData = pendingData[currentIntent];
        const missingSlots = difference(intentObj.slots, Object.keys(currentPendingData));
        if (missingSlots.length === 0) {
            const completedObj = ksl[currentIntent];
            wolfState.currentIntent = null;
            return {
                type: 'userAction',
                name: currentIntent
            };
            // return {
            //   replyText: () => {
            //     return completedObj.acknowledge(currentPendingData)
            //   },
            //   mutate: () => {
            //     return completedObj.submit(pendingData[currentIntent], convoState)
            //   }
            // }
        }
        const pendingSlot = slots_1.default.find(slot => slot.entity === missingSlots[0]);
        return {
            type: 'slot',
            name: pendingSlot.entity
        };
        // return {
        //   replyText: () => {
        //     return pendingSlot.query
        //   },
        //   mutate: () => {
        //     const waitingForValue = pendingSlot.entity
        //     return set(convoState, 'wolf.waitingFor', waitingForValue)
        //   }
        // } // slots[missingSlots[0]] // {query} 
    }
    function outtake(state, reply, result) {
        if (result.type === 'slot') {
            const slot = slots_1.default.find((slot) => slot.entity === result.name);
            state.conversation.wolf.waitingFor = slot.entity;
            reply(slot.query);
            return;
        }
        if (result.type === 'userAction') {
            const intent = intents_1.default.find((intent) => intent.name === result.name);
            const userAction = ksl[intent.name];
            const data = state.conversation.wolf.pendingData[intent.name];
            const prev = state.conversation[userAction.props.name];
            state.conversation[userAction.props.name] = userAction.submit(prev, data);
            const ackObj = {
                getBotState: () => state,
                getSgState: () => state.conversation[userAction.props.name],
                getSubmittedData: () => data
            };
            reply(userAction.acknowledge(ackObj));
            // remove pendingData
            state.conversation.wolf.currentIntent = null;
            state.conversation.wolf.pendingData[intent.name] = undefined;
        }
        // state.conversation = mutate() // returns the state
        // reply(replyText())
    }
    new botbuilder_1.Bot(adapter)
        .use(new botbuilder_1.MemoryStorage())
        .use(new botbuilder_1.BotStateManager())
        .use({
        contextCreated: (context, next) => {
            const conversationState = context.state.conversation;
            if (conversationState && conversationState.wolf) {
                return next();
            }
            if (!conversationState) {
                context.state.conversation = {};
            }
            context.state.conversation.wolf = {
                currentIntent: null,
                waitingFor: null,
                pendingData: {},
                // intake: null,
                // actions: [],
                // outtake: null,
                data: {}
            };
            return next();
        }
    })
        .onReceive((context) => {
        try {
            if (context.request.type !== 'message') {
                return;
            }
            const message = context.request.text;
            const wolfState = context.state.conversation.wolf;
            // Intake
            const intakeResult = intake(wolfState, message);
            // Actions
            const actions = getActions(wolfState, intakeResult); // [('path', value) => string, ]
            runActions(context.reply.bind(context), actions);
            // Evaluate
            const evaluateResult = evaluate(context.state.conversation, wolfState);
            // Outtake
            outtake(context.state, context.reply.bind(context), evaluateResult);
        }
        catch (err) {
            console.error(err);
        }
    });
});
//# sourceMappingURL=bot.js.map