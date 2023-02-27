"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthrDidResolver = exports.getResolver = void 0;
const basex_1 = require("@ethersproject/basex");
const bignumber_1 = require("@ethersproject/bignumber");
const configuration_1 = require("./configuration");
const controller_1 = require("./controller");
const helpers_1 = require("./helpers");
const logParser_1 = require("./logParser");
function getResolver(options) {
    return new EthrDidResolver(options).build();
}
exports.getResolver = getResolver;
class EthrDidResolver {
    constructor(options) {
        this.contracts = (0, configuration_1.configureResolverWithNetworks)(options);
    }
    /**
     * returns the current owner of a DID (represented by an address or public key)
     *
     * @param address
     */
    async getOwner(address, networkId, blockTag) {
        //TODO: check if address or public key
        return new controller_1.EthrDidController(address, this.contracts[networkId]).getOwner(address, blockTag);
    }
    /**
     * returns the previous change
     *
     * @param address
     */
    async previousChange(address, networkId, blockTag) {
        const result = await this.contracts[networkId].functions.changed(address, { blockTag });
        // console.log(`last change result: '${BigNumber.from(result['0'])}'`)
        return bignumber_1.BigNumber.from(result['0']);
    }
    async getBlockMetadata(blockHeight, networkId) {
        const block = await this.contracts[networkId].provider.getBlock(blockHeight);
        return {
            height: block.number.toString(),
            isoDate: new Date(block.timestamp * 1000).toISOString().replace('.000', ''),
        };
    }
    async changeLog(identity, networkId, blockTag = 'latest') {
        const contract = this.contracts[networkId];
        const provider = contract.provider;
        const hexChainId = networkId.startsWith('0x') ? networkId : undefined;
        //TODO: this can be used to check if the configuration is ok
        const chainId = hexChainId ? bignumber_1.BigNumber.from(hexChainId).toNumber() : (await provider.getNetwork()).chainId;
        const history = [];
        const { address, publicKey } = (0, helpers_1.interpretIdentifier)(identity);
        const controllerKey = publicKey;
        let previousChange = await this.previousChange(address, networkId, blockTag);
        while (previousChange) {
            const blockNumber = previousChange;
            const logs = await provider.getLogs({
                address: contract.address,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                topics: [null, `0x000000000000000000000000${address.slice(2)}`],
                fromBlock: previousChange.toHexString(),
                toBlock: previousChange.toHexString(),
            });
            const events = (0, logParser_1.logDecoder)(contract, logs);
            events.reverse();
            previousChange = null;
            for (const event of events) {
                history.unshift(event);
                if (event.previousChange.lt(blockNumber)) {
                    previousChange = event.previousChange;
                }
            }
        }
        return { address, history, controllerKey, chainId };
    }
    wrapDidDocument(did, address, controllerKey, history, chainId, blockHeight, now) {
        var _a;
        const baseDIDDocument = {
            '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/secp256k1recovery-2020/v2'],
            id: did,
            verificationMethod: [],
            authentication: [],
            assertionMethod: [],
        };
        let controller = address;
        const authentication = [`${did}#controller`];
        const keyAgreement = [];
        let versionId = 0;
        let nextVersionId = Number.POSITIVE_INFINITY;
        let deactivated = false;
        let delegateCount = 0;
        let serviceCount = 0;
        let endpoint = '';
        const auth = {};
        const keyAgreementRefs = {};
        const pks = {};
        const services = {};
        for (const event of history) {
            if (blockHeight !== -1 && event.blockNumber > blockHeight) {
                if (nextVersionId > event.blockNumber) {
                    nextVersionId = event.blockNumber;
                }
                continue;
            }
            else {
                if (versionId < event.blockNumber) {
                    versionId = event.blockNumber;
                }
            }
            const validTo = event.validTo || bignumber_1.BigNumber.from(0);
            const eventIndex = `${event._eventName}-${event.delegateType || event.name}-${event.delegate || event.value}`;
            if (validTo && validTo.gte(now)) {
                if (event._eventName === helpers_1.eventNames.DIDDelegateChanged) {
                    const currentEvent = event;
                    delegateCount++;
                    const delegateType = currentEvent.delegateType; //conversion from bytes32 is done in logParser
                    switch (delegateType) {
                        case 'sigAuth':
                            auth[eventIndex] = `${did}#delegate-${delegateCount}`;
                        // eslint-disable-line no-fallthrough
                        case 'veriKey':
                            pks[eventIndex] = {
                                id: `${did}#delegate-${delegateCount}`,
                                type: helpers_1.verificationMethodTypes.EcdsaSecp256k1RecoveryMethod2020,
                                controller: did,
                                blockchainAccountId: `eip155:${chainId}:${currentEvent.delegate}`,
                            };
                            break;
                    }
                }
                else if (event._eventName === helpers_1.eventNames.DIDAttributeChanged) {
                    const currentEvent = event;
                    const name = currentEvent.name; //conversion from bytes32 is done in logParser
                    const match = name.match(/^did\/(pub|svc)\/(\w+)(\/(\w+))?(\/(\w+))?$/);
                    if (match) {
                        const section = match[1];
                        const algorithm = match[2];
                        const type = helpers_1.legacyAttrTypes[match[4]] || match[4];
                        const encoding = match[6];
                        switch (section) {
                            case 'pub': {
                                delegateCount++;
                                const pk = {
                                    id: `${did}#delegate-${delegateCount}`,
                                    type: `${algorithm}${type}`,
                                    controller: did,
                                };
                                pk.type = helpers_1.legacyAlgoMap[pk.type] || algorithm;
                                switch (encoding) {
                                    case null:
                                    case undefined:
                                    case 'hex':
                                        pk.publicKeyHex = (0, helpers_1.strip0x)(currentEvent.value);
                                        break;
                                    case 'base64':
                                        pk.publicKeyBase64 = Buffer.from(currentEvent.value.slice(2), 'hex').toString('base64');
                                        break;
                                    case 'base58':
                                        pk.publicKeyBase58 = basex_1.Base58.encode(Buffer.from(currentEvent.value.slice(2), 'hex'));
                                        break;
                                    case 'pem':
                                        pk.publicKeyPem = Buffer.from(currentEvent.value.slice(2), 'hex').toString();
                                        break;
                                    default:
                                        pk.value = (0, helpers_1.strip0x)(currentEvent.value);
                                }
                                pks[eventIndex] = pk;
                                if (match[4] === 'sigAuth') {
                                    auth[eventIndex] = pk.id;
                                }
                                else if (match[4] === 'enc') {
                                    keyAgreementRefs[eventIndex] = pk.id;
                                }
                                break;
                            }
                            case 'svc':
                                serviceCount++;
                                try {
                                    endpoint = JSON.parse(Buffer.from(currentEvent.value.slice(2), 'hex').toString());
                                }
                                catch (_b) {
                                    endpoint = Buffer.from(currentEvent.value.slice(2), 'hex').toString();
                                }
                                services[eventIndex] = {
                                    id: `${did}#service-${serviceCount}`,
                                    type: algorithm,
                                    serviceEndpoint: endpoint,
                                };
                                break;
                        }
                    }
                }
            }
            else if (event._eventName === helpers_1.eventNames.DIDOwnerChanged) {
                const currentEvent = event;
                controller = currentEvent.owner;
                if (currentEvent.owner === helpers_1.nullAddress) {
                    deactivated = true;
                    break;
                }
            }
            else {
                if (event._eventName === helpers_1.eventNames.DIDDelegateChanged ||
                    (event._eventName === helpers_1.eventNames.DIDAttributeChanged &&
                        event.name.match(/^did\/pub\//))) {
                    delegateCount++;
                }
                else if (event._eventName === helpers_1.eventNames.DIDAttributeChanged &&
                    event.name.match(/^did\/svc\//)) {
                    serviceCount++;
                }
                delete auth[eventIndex];
                delete pks[eventIndex];
                delete services[eventIndex];
            }
        }
        const publicKeys = [
            {
                id: `${did}#controller`,
                type: helpers_1.verificationMethodTypes.EcdsaSecp256k1RecoveryMethod2020,
                controller: did,
                blockchainAccountId: `eip155:${chainId}:${controller}`,
            },
        ];
        if (controllerKey && controller == address) {
            publicKeys.push({
                id: `${did}#controllerKey`,
                type: helpers_1.verificationMethodTypes.EcdsaSecp256k1VerificationKey2019,
                controller: did,
                publicKeyHex: (0, helpers_1.strip0x)(controllerKey),
            });
            authentication.push(`${did}#controllerKey`);
        }
        const didDocument = {
            ...baseDIDDocument,
            verificationMethod: publicKeys.concat(Object.values(pks)),
            authentication: authentication.concat(Object.values(auth)),
        };
        if (Object.values(services).length > 0) {
            didDocument.service = Object.values(services);
        }
        if (Object.values(keyAgreementRefs).length > 0) {
            didDocument.keyAgreement = keyAgreement.concat(Object.values(keyAgreementRefs));
        }
        didDocument.assertionMethod = [...(((_a = didDocument.verificationMethod) === null || _a === void 0 ? void 0 : _a.map((pk) => pk.id)) || [])];
        return deactivated
            ? {
                didDocument: { ...baseDIDDocument, '@context': 'https://www.w3.org/ns/did/v1' },
                deactivated,
                versionId,
                nextVersionId,
            }
            : { didDocument, deactivated, versionId, nextVersionId };
    }
    async resolve(did, parsed, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _unused, options) {
        var _a;
        const fullId = parsed.id.match(helpers_1.identifierMatcher);
        if (!fullId) {
            return {
                didResolutionMetadata: {
                    error: helpers_1.Errors.invalidDid,
                    message: `Not a valid did:ethr: ${parsed.id}`,
                },
                didDocumentMetadata: {},
                didDocument: null,
            };
        }
        const id = fullId[2];
        const networkId = !fullId[1] ? 'mainnet' : fullId[1].slice(0, -1);
        let blockTag = options.blockTag || 'latest';
        if (typeof parsed.query === 'string') {
            const qParams = new URLSearchParams(parsed.query);
            blockTag = (_a = qParams.get('versionId')) !== null && _a !== void 0 ? _a : blockTag;
            try {
                blockTag = Number.parseInt(blockTag);
            }
            catch (e) {
                blockTag = 'latest';
                // invalid versionId parameters are ignored
            }
        }
        if (!this.contracts[networkId]) {
            return {
                didResolutionMetadata: {
                    error: helpers_1.Errors.unknownNetwork,
                    message: `The DID resolver does not have a configuration for network: ${networkId}`,
                },
                didDocumentMetadata: {},
                didDocument: null,
            };
        }
        let now = bignumber_1.BigNumber.from(Math.floor(new Date().getTime() / 1000));
        if (typeof blockTag === 'number') {
            const block = await this.getBlockMetadata(blockTag, networkId);
            now = bignumber_1.BigNumber.from(Date.parse(block.isoDate) / 1000);
        }
        else {
            // 'latest'
        }
        const { address, history, controllerKey, chainId } = await this.changeLog(id, networkId, 'latest');
        try {
            const { didDocument, deactivated, versionId, nextVersionId } = this.wrapDidDocument(did, address, controllerKey, history, chainId, blockTag, now);
            const status = deactivated ? { deactivated: true } : {};
            let versionMeta = {};
            let versionMetaNext = {};
            if (versionId !== 0) {
                const block = await this.getBlockMetadata(versionId, networkId);
                versionMeta = {
                    versionId: block.height,
                    updated: block.isoDate,
                };
            }
            if (nextVersionId !== Number.POSITIVE_INFINITY) {
                const block = await this.getBlockMetadata(nextVersionId, networkId);
                versionMetaNext = {
                    nextVersionId: block.height,
                    nextUpdate: block.isoDate,
                };
            }
            return {
                didDocumentMetadata: { ...status, ...versionMeta, ...versionMetaNext },
                didResolutionMetadata: { contentType: 'application/did+ld+json' },
                didDocument,
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (e) {
            return {
                didResolutionMetadata: {
                    error: helpers_1.Errors.notFound,
                    message: e.toString(), // This is not in spec, nut may be helpful
                },
                didDocumentMetadata: {},
                didDocument: null,
            };
        }
    }
    build() {
        return { ethr: this.resolve.bind(this) };
    }
}
exports.EthrDidResolver = EthrDidResolver;
//# sourceMappingURL=resolver.js.map