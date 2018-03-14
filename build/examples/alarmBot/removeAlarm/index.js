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
    exports.props = {
        name: 'alarms'
    };
    exports.submit = (prev = [], value) => {
        return prev.filter(alarm => alarm.alarmName !== value.alarmName);
    };
    exports.acknowledge = ({ getSubmittedData }) => {
        const value = getSubmittedData();
        return `Your ${value.alarmName} alarm is removed!`;
    };
});
//# sourceMappingURL=index.js.map