// Intake
// Action
// Evaluate
// Outtake
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
    exports.intake = (message) => {
        return {};
    };
    exports.actionRunner = () => {
    };
    exports.evaluate = () => {
    };
    exports.outtake = () => {
    };
});
//# sourceMappingURL=index.js.map