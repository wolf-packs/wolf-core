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
    exports.submit = (prev = []) => {
        return prev;
    };
    exports.acknowledge = ({ getSgState }) => {
        const alarms = getSgState();
        return alarms.map(alarms => alarms.alarmName + ' at ' + alarms.alarmTime).join(', ');
    };
});
//# sourceMappingURL=index.js.map