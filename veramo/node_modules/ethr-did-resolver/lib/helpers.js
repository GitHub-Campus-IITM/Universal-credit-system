"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errors = exports.signMetaTxData = exports.interpretIdentifier = exports.stringToBytes32 = exports.bytes32toString = exports.strip0x = exports.legacyAlgoMap = exports.legacyAttrTypes = exports.eventNames = exports.verificationMethodTypes = exports.MESSAGE_PREFIX = exports.DEFAULT_JSON_RPC = exports.DEFAULT_REGISTRY_ADDRESS = exports.nullAddress = exports.identifierMatcher = void 0;
const address_1 = require("@ethersproject/address");
const transactions_1 = require("@ethersproject/transactions");
const keccak256_1 = require("@ethersproject/keccak256");
const bytes_1 = require("@ethersproject/bytes");
const signing_key_1 = require("@ethersproject/signing-key");
exports.identifierMatcher = /^(.*)?(0x[0-9a-fA-F]{40}|0x[0-9a-fA-F]{66})$/;
exports.nullAddress = '0x0000000000000000000000000000000000000000';
exports.DEFAULT_REGISTRY_ADDRESS = '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b';
exports.DEFAULT_JSON_RPC = 'http://127.0.0.1:8545/';
exports.MESSAGE_PREFIX = '0x1900';
var verificationMethodTypes;
(function (verificationMethodTypes) {
    verificationMethodTypes["EcdsaSecp256k1VerificationKey2019"] = "EcdsaSecp256k1VerificationKey2019";
    verificationMethodTypes["EcdsaSecp256k1RecoveryMethod2020"] = "EcdsaSecp256k1RecoveryMethod2020";
    verificationMethodTypes["Ed25519VerificationKey2018"] = "Ed25519VerificationKey2018";
    verificationMethodTypes["RSAVerificationKey2018"] = "RSAVerificationKey2018";
    verificationMethodTypes["X25519KeyAgreementKey2019"] = "X25519KeyAgreementKey2019";
})(verificationMethodTypes = exports.verificationMethodTypes || (exports.verificationMethodTypes = {}));
var eventNames;
(function (eventNames) {
    eventNames["DIDOwnerChanged"] = "DIDOwnerChanged";
    eventNames["DIDAttributeChanged"] = "DIDAttributeChanged";
    eventNames["DIDDelegateChanged"] = "DIDDelegateChanged";
})(eventNames = exports.eventNames || (exports.eventNames = {}));
exports.legacyAttrTypes = {
    sigAuth: 'SignatureAuthentication2018',
    veriKey: 'VerificationKey2018',
    enc: 'KeyAgreementKey2019',
};
exports.legacyAlgoMap = {
    /**@deprecated */
    Secp256k1VerificationKey2018: verificationMethodTypes.EcdsaSecp256k1VerificationKey2019,
    /**@deprecated */
    Ed25519SignatureAuthentication2018: verificationMethodTypes.Ed25519VerificationKey2018,
    /**@deprecated */
    Secp256k1SignatureAuthentication2018: verificationMethodTypes.EcdsaSecp256k1VerificationKey2019,
    //keep legacy mapping
    RSAVerificationKey2018: verificationMethodTypes.RSAVerificationKey2018,
    Ed25519VerificationKey2018: verificationMethodTypes.Ed25519VerificationKey2018,
    X25519KeyAgreementKey2019: verificationMethodTypes.X25519KeyAgreementKey2019,
};
function strip0x(input) {
    return input.startsWith('0x') ? input.slice(2) : input;
}
exports.strip0x = strip0x;
function bytes32toString(input) {
    const buff = typeof input === 'string' ? Buffer.from(input.slice(2), 'hex') : Buffer.from(input);
    return buff.toString('utf8').replace(/\0+$/, '');
}
exports.bytes32toString = bytes32toString;
function stringToBytes32(str) {
    const buffStr = '0x' + Buffer.from(str).slice(0, 32).toString('hex');
    return buffStr + '0'.repeat(66 - buffStr.length);
}
exports.stringToBytes32 = stringToBytes32;
function interpretIdentifier(identifier) {
    let id = identifier;
    let network = undefined;
    if (id.startsWith('did:ethr')) {
        id = id.split('?')[0];
        const components = id.split(':');
        id = components[components.length - 1];
        if (components.length >= 4) {
            network = components.splice(2, components.length - 3).join(':');
        }
    }
    if (id.length > 42) {
        return { address: (0, transactions_1.computeAddress)(id), publicKey: id, network };
    }
    else {
        return { address: (0, address_1.getAddress)(id), network }; // checksum address
    }
}
exports.interpretIdentifier = interpretIdentifier;
async function signMetaTxData(identity, signerAddress, privateKeyBytes, dataBytes, didReg) {
    const nonce = await didReg.nonce(signerAddress);
    const paddedNonce = (0, bytes_1.zeroPad)((0, bytes_1.arrayify)(nonce), 32);
    const dataToSign = (0, bytes_1.hexConcat)(['0x1900', didReg.address, paddedNonce, identity, dataBytes]);
    const hash = (0, keccak256_1.keccak256)(dataToSign);
    return new signing_key_1.SigningKey(privateKeyBytes).signDigest(hash);
}
exports.signMetaTxData = signMetaTxData;
var Errors;
(function (Errors) {
    /**
     * The resolver has failed to construct the DID document.
     * This can be caused by a network issue, a wrong registry address or malformed logs while parsing the registry history.
     * Please inspect the `DIDResolutionMetadata.message` to debug further.
     */
    Errors["notFound"] = "notFound";
    /**
     * The resolver does not know how to resolve the given DID. Most likely it is not a `did:ethr`.
     */
    Errors["invalidDid"] = "invalidDid";
    /**
     * The resolver is misconfigured or is being asked to resolve a DID anchored on an unknown network
     */
    Errors["unknownNetwork"] = "unknownNetwork";
})(Errors = exports.Errors || (exports.Errors = {}));
//# sourceMappingURL=helpers.js.map