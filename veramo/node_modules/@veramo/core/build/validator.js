"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateReturnType = exports.validateArguments = exports.PluginReturnTypeError = exports.ValidationError = void 0;
const ZSchema = require('z-schema');
const validator = new ZSchema({});
validator.setRemoteReference('http://json-schema.org/draft-07/schema#', {
    type: ['array', 'boolean', 'integer', 'number', 'object', 'string'],
});
/**
 * Represents a Schema validation error.
 *
 * This can occur when a method of the agent is invoked with certain parameters or the returned value doesn't match the
 * declared plugin schema.
 *
 * @public
 */
class ValidationError extends Error {
    constructor(message, method, code, path, description) {
        super(message);
        this.name = 'ValidationError';
        this.message = message + '; ' + method + '; ' + path + '; ' + code + '; ' + description;
        this.method = method;
        this.description = description;
        this.path = path;
        this.code = code;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
exports.ValidationError = ValidationError;
class PluginReturnTypeError extends Error {
    constructor(message, method, code, path, description) {
        super(message);
        this.name = 'PluginReturnTypeError';
        this.message = message + '; ' + method + '; ' + path + '; ' + code + '; ' + description;
        this.method = method;
        this.description = description;
        this.path = path;
        this.code = code;
        Object.setPrototypeOf(this, PluginReturnTypeError.prototype);
    }
}
exports.PluginReturnTypeError = PluginReturnTypeError;
const validateArguments = (method, args, schema) => {
    const valid = validator.validate(args, schema, {
        schemaPath: 'components.methods.' + method + '.arguments',
    });
    if (!valid) {
        const errors = validator.getLastErrors();
        throw new ValidationError(errors[0].message, method, errors[0].code, errors[0].path, errors[0].description);
    }
};
exports.validateArguments = validateArguments;
const validateReturnType = (method, args, schema) => {
    const valid = validator.validate(args, schema, {
        schemaPath: 'components.methods.' + method + '.returnType',
    });
    if (!valid) {
        const errors = validator.getLastErrors();
        throw new PluginReturnTypeError(errors[0].message, method, errors[0].code, errors[0].path, errors[0].description);
    }
};
exports.validateReturnType = validateReturnType;
//# sourceMappingURL=validator.js.map