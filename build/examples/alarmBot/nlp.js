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
    const addAlarmTester = new RegExp('add');
    const listAlarmsTester = new RegExp('list');
    const removeAlarmTester = new RegExp('remove');
    const testers = [
        {
            name: 'addAlarm',
            tester: (input) => {
                return addAlarmTester.test(input);
            }
        },
        {
            name: 'listAlarms',
            tester: (input) => {
                return listAlarmsTester.test(input);
            }
        },
        {
            name: 'removeAlarm',
            tester: (input) => {
                return removeAlarmTester.test(input);
            }
        }
    ];
    const recognizers = [
        (input) => {
            const nameReg = /called (\w*)/;
            const result = nameReg.exec(input);
            if (!result) {
                return null;
            }
            return {
                entity: 'alarmName',
                value: result[1],
                string: result[1]
            };
        },
        (input) => {
            const timeReg = /at (\d\s?(am|pm))/;
            const result = timeReg.exec(input);
            if (!result) {
                return null;
            }
            return {
                entity: 'alarmTime',
                value: result[1],
                string: result[1]
            };
        }
    ];
    function nlp(input) {
        const found = Object.assign({}, testers.find((tester) => tester.tester(input)));
        if (!found) {
            return null;
        }
        const { name: intent } = found;
        const entities = recognizers
            .map(rec => rec(input))
            .filter(_ => _);
        return {
            intent,
            entities
        };
    }
    // "add alarm at 8am" => {intent: "addAlarm", entities: [{entity: "alarmTime", value: "8am"}]}
    exports.default = nlp;
});
//# sourceMappingURL=nlp.js.map