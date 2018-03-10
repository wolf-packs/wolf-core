(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "botbuilder", "botbuilder-services"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const botbuilder_1 = require("botbuilder");
    const botbuilder_services_1 = require("botbuilder-services");
    const restify = require('restify');
    // Create server
    let server = restify.createServer();
    server.listen(process.env.port || 3978, () => {
        console.log(`${server.name} listening to ${server.url}`);
    });
    // Create connector
    const adapter = new botbuilder_services_1.BotFrameworkAdapter({ appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD });
    server.post('/api/messages', adapter.listen());
    new botbuilder_1.Bot(adapter)
        .use(new botbuilder_1.MemoryStorage())
        .use(new botbuilder_1.BotStateManager())
        .onReceive((context) => {
        if (context.request.type !== 'message') {
            return;
        }
        context.reply('hi');
    });
});
//# sourceMappingURL=bot.js.map