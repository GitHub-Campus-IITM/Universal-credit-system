"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logDecoder = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const helpers_1 = require("./helpers");
function populateEventMetaClass(logResult, blockNumber) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = {};
    if (logResult.eventFragment.inputs.length !== logResult.args.length) {
        throw new TypeError('malformed event input. wrong number of arguments');
    }
    logResult.eventFragment.inputs.forEach((input, index) => {
        let val = logResult.args[index];
        if (typeof val === 'object') {
            val = bignumber_1.BigNumber.from(val);
        }
        if (input.type === 'bytes32') {
            val = (0, helpers_1.bytes32toString)(val);
        }
        result[input.name] = val;
    });
    result._eventName = logResult.name;
    result.blockNumber = blockNumber;
    return result;
}
function logDecoder(contract, logs) {
    const results = logs.map((log) => {
        const res = contract.interface.parseLog(log);
        const event = populateEventMetaClass(res, log.blockNumber);
        return event;
    });
    return results;
}
exports.logDecoder = logDecoder;
//# sourceMappingURL=logParser.js.map