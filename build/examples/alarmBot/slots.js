(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = [
        {
            entity: 'alarmName',
            type: 'string',
            query: 'What is the name of the alarm?',
            acknowledge: (value) => `ok! name is set to ${value}.`
        },
        {
            entity: 'alarmTime',
            type: 'string',
            query: 'What is the time you want to set?',
            acknowledge: (value) => `ok! time is set to ${value}.`
        }
    ];
});
//# sourceMappingURL=slots.js.map