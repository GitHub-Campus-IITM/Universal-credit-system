// noinspection ES6PreferShortImport
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MessagingRouter, RequestWithAgentRouter } from '../../packages/remote-server/src';
import * as u8a from 'uint8arrays';
// @ts-ignore
import express from 'express';
const DIDCommEventSniffer = {
    eventTypes: ['DIDCommV2Message-sent', 'DIDCommV2Message-received'],
    onEvent: jest.fn(),
};
export default (testContext) => {
    describe('DIDComm using did:ethr:ganache flow', () => {
        let agent;
        let alice;
        let bob;
        let didCommEndpointServer;
        let listeningPort = Math.round(Math.random() * 32000 + 2048);
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield testContext.setup({ plugins: [DIDCommEventSniffer] });
            agent = testContext.getAgent();
            alice = yield agent.didManagerImport({
                controllerKeyId: 'alice-controller-key',
                did: 'did:ethr:ganache:0x0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
                provider: 'did:ethr:ganache',
                alias: 'alice-did-ethr',
                keys: [
                    {
                        privateKeyHex: '0000000000000000000000000000000000000000000000000000000000000001',
                        kms: 'local',
                        type: 'Secp256k1',
                        kid: 'alice-controller-key',
                    },
                ],
            });
            bob = yield agent.didManagerImport({
                controllerKeyId: 'bob-controller-key',
                did: 'did:ethr:ganache:0x02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
                provider: 'did:ethr:ganache',
                alias: 'bob-did-ethr',
                keys: [
                    {
                        privateKeyHex: '0000000000000000000000000000000000000000000000000000000000000002',
                        kms: 'local',
                        type: 'Secp256k1',
                        kid: 'bob-controller-key',
                    },
                ],
            });
            const requestWithAgent = RequestWithAgentRouter({ agent });
            yield new Promise((resolve) => {
                //setup a server to receive HTTP messages and forward them to this agent to be processed as DIDComm messages
                const app = express();
                // app.use(requestWithAgent)
                app.use('/messaging', requestWithAgent, MessagingRouter({
                    metaData: { type: 'DIDComm', value: 'integration test' },
                }));
                didCommEndpointServer = app.listen(listeningPort, () => {
                    resolve(true);
                });
            });
        }));
        afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield new Promise((resolve, reject) => didCommEndpointServer === null || didCommEndpointServer === void 0 ? void 0 : didCommEndpointServer.close(resolve));
            }
            catch (e) {
                //nop
            }
            yield testContext.tearDown();
        }));
        it('should add dummy service to identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const result = yield agent.didManagerAddService({
                did: alice.did,
                service: {
                    id: 'localhost-useless-endpoint',
                    type: 'DIDComm',
                    serviceEndpoint: `http://localhost:${listeningPort}/foobar`,
                    description: 'this endpoint will be removed',
                },
            });
            expect(result.substr(0, 2)).toEqual('0x');
            const resolution = yield agent.resolveDid({ didUrl: alice.did });
            expect((_b = (_a = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _a === void 0 ? void 0 : _a.service) === null || _b === void 0 ? void 0 : _b[0].serviceEndpoint).toEqual(`http://localhost:${listeningPort}/foobar`);
        }));
        it('should remove dummy service from identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            var _c;
            const result = yield agent.didManagerRemoveService({
                did: alice.did,
                id: 'localhost-useless-endpoint',
            });
            expect(result.substr(0, 2)).toEqual('0x');
            const resolution = yield agent.resolveDid({ didUrl: alice.did });
            expect(resolution === null || resolution === void 0 ? void 0 : resolution.didDocument).not.toBeNull();
            expect([...(((_c = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _c === void 0 ? void 0 : _c.service) || [])]).toEqual([]);
        }));
        it('should add dummy service 2 to identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            var _d, _e;
            const result = yield agent.didManagerAddService({
                did: alice.did,
                service: {
                    id: 'localhost-useless-endpoint-2',
                    type: 'DIDComm',
                    serviceEndpoint: { uri: `http://localhost:${listeningPort}/foobar` },
                    description: 'this endpoint will be removed',
                },
            });
            expect(result.substr(0, 2)).toEqual('0x');
            const resolution = yield agent.resolveDid({ didUrl: alice.did });
            expect((_e = (_d = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _d === void 0 ? void 0 : _d.service) === null || _e === void 0 ? void 0 : _e[0].serviceEndpoint).toEqual({
                uri: `http://localhost:${listeningPort}/foobar`,
            });
        }));
        it('should remove dummy service 2 from identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            var _f;
            const result = yield agent.didManagerRemoveService({
                did: alice.did,
                id: 'localhost-useless-endpoint-2',
            });
            expect(result.substr(0, 2)).toEqual('0x');
            const resolution = yield agent.resolveDid({ didUrl: alice.did });
            expect(resolution === null || resolution === void 0 ? void 0 : resolution.didDocument).not.toBeNull();
            expect([...(((_f = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _f === void 0 ? void 0 : _f.service) || [])]).toEqual([]);
        }));
        it('should add dummy service 3 to identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            var _g, _h;
            const result = yield agent.didManagerAddService({
                did: alice.did,
                service: {
                    id: 'localhost-useless-endpoint-3',
                    type: 'DIDComm',
                    serviceEndpoint: [{ uri: `http://localhost:${listeningPort}/foobar` }],
                    description: 'this endpoint will be removed',
                },
            });
            expect(result.substr(0, 2)).toEqual('0x');
            const resolution = yield agent.resolveDid({ didUrl: alice.did });
            expect((_h = (_g = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _g === void 0 ? void 0 : _g.service) === null || _h === void 0 ? void 0 : _h[0].serviceEndpoint).toEqual([
                { uri: `http://localhost:${listeningPort}/foobar` },
            ]);
        }));
        it('should remove dummy service 3 from identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            var _j;
            const result = yield agent.didManagerRemoveService({
                did: alice.did,
                id: 'localhost-useless-endpoint-3',
            });
            expect(result.substr(0, 2)).toEqual('0x');
            const resolution = yield agent.resolveDid({ didUrl: alice.did });
            expect(resolution === null || resolution === void 0 ? void 0 : resolution.didDocument).not.toBeNull();
            expect([...(((_j = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _j === void 0 ? void 0 : _j.service) || [])]).toEqual([]);
        }));
        it('should add dummy service 4 to identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            var _k, _l;
            const result = yield agent.didManagerAddService({
                did: alice.did,
                service: {
                    id: 'localhost-useless-endpoint-4',
                    type: 'DIDComm',
                    serviceEndpoint: [`http://localhost:${listeningPort}/foobar`],
                    description: 'this endpoint will be removed',
                },
            });
            expect(result.substr(0, 2)).toEqual('0x');
            const resolution = yield agent.resolveDid({ didUrl: alice.did });
            expect((_l = (_k = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _k === void 0 ? void 0 : _k.service) === null || _l === void 0 ? void 0 : _l[0].serviceEndpoint).toEqual([
                `http://localhost:${listeningPort}/foobar`,
            ]);
        }));
        it('should remove dummy service 4 from identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            var _m;
            const result = yield agent.didManagerRemoveService({
                did: alice.did,
                id: 'localhost-useless-endpoint-4',
            });
            expect(result.substr(0, 2)).toEqual('0x');
            const resolution = yield agent.resolveDid({ didUrl: alice.did });
            expect(resolution === null || resolution === void 0 ? void 0 : resolution.didDocument).not.toBeNull();
            expect([...(((_m = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _m === void 0 ? void 0 : _m.service) || [])]).toEqual([]);
        }));
        let dummyKey;
        it('should add dummy key to identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            var _o, _p;
            dummyKey = yield agent.keyManagerCreate({
                kms: 'local',
                type: 'Secp256k1',
            });
            const result = yield agent.didManagerAddKey({
                did: alice.did,
                key: dummyKey,
            });
            expect(result.substr(0, 2)).toEqual('0x');
            const resolution = yield agent.resolveDid({ didUrl: alice.did });
            expect((_p = (_o = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _o === void 0 ? void 0 : _o.verificationMethod) === null || _p === void 0 ? void 0 : _p[2].publicKeyHex).toEqual(dummyKey.publicKeyHex);
        }));
        it('should remove dummy key from identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            var _q, _r;
            const result = yield agent.didManagerRemoveKey({
                did: alice.did,
                kid: dummyKey.kid,
            });
            expect(result.substr(0, 2)).toEqual('0x');
            const resolution = yield agent.resolveDid({ didUrl: alice.did });
            expect((_r = (_q = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _q === void 0 ? void 0 : _q.verificationMethod) === null || _r === void 0 ? void 0 : _r.length).toEqual(2);
        }));
        it('should add DIDComm service to receiver DID with serviceEndpoint as string', () => __awaiter(void 0, void 0, void 0, function* () {
            var _s, _t;
            const result = yield agent.didManagerAddService({
                did: alice.did,
                service: {
                    id: 'alice-didcomm-endpoint',
                    type: 'DIDCommMessaging',
                    serviceEndpoint: `http://localhost:${listeningPort}/messaging`,
                    description: 'handles DIDComm messages',
                },
            });
            expect(result.substr(0, 2)).toEqual('0x');
            const resolution = yield agent.resolveDid({ didUrl: alice.did });
            expect((_t = (_s = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _s === void 0 ? void 0 : _s.service) === null || _t === void 0 ? void 0 : _t[0].serviceEndpoint).toEqual(`http://localhost:${listeningPort}/messaging`);
        }));
        it('should send an signed message from bob to alice with serviceEndpoint as string', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(3);
            const message = {
                type: 'test',
                to: alice.did,
                from: bob.did,
                id: 'test-jws-success',
                body: { hello: 'world' },
            };
            const packedMessage = yield agent.packDIDCommMessage({
                packing: 'jws',
                message,
            });
            const result = yield agent.sendDIDCommMessage({
                messageId: 'test-jws-success',
                packedMessage,
                recipientDidUrl: alice.did,
            });
            expect(result).toBeTruthy();
            expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith({ data: 'test-jws-success', type: 'DIDCommV2Message-sent' }, expect.anything());
            // in our case, it is the same agent that is receiving the messages
            expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith({
                data: {
                    message: {
                        body: { hello: 'world' },
                        from: bob.did,
                        id: 'test-jws-success',
                        to: alice.did,
                        type: 'test',
                    },
                    metaData: { packing: 'jws' },
                },
                type: 'DIDCommV2Message-received',
            }, expect.anything());
        }));
        it('should remove DIDComm service from receiver', () => __awaiter(void 0, void 0, void 0, function* () {
            var _u;
            const result = yield agent.didManagerRemoveService({
                did: alice.did,
                id: 'alice-didcomm-endpoint',
            });
            expect(result.substr(0, 2)).toEqual('0x');
            const resolution = yield agent.resolveDid({ didUrl: alice.did });
            expect(resolution === null || resolution === void 0 ? void 0 : resolution.didDocument).not.toBeNull();
            expect([...(((_u = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _u === void 0 ? void 0 : _u.service) || [])]).toEqual([]);
        }));
        it('should add DIDComm service to receiver DID with serviceEndpoint as array of strings', () => __awaiter(void 0, void 0, void 0, function* () {
            var _v, _w;
            const result = yield agent.didManagerAddService({
                did: alice.did,
                service: {
                    id: 'alice-didcomm-endpoint',
                    type: 'DIDCommMessaging',
                    serviceEndpoint: [`http://localhost:${listeningPort}/messaging`],
                    description: 'handles DIDComm messages',
                },
            });
            expect(result.substr(0, 2)).toEqual('0x');
            const resolution = yield agent.resolveDid({ didUrl: alice.did });
            expect((_w = (_v = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _v === void 0 ? void 0 : _v.service) === null || _w === void 0 ? void 0 : _w[0].serviceEndpoint).toEqual([
                `http://localhost:${listeningPort}/messaging`,
            ]);
        }));
        it('should send an signed message from bob to alice with serviceEndpoint as array of strings', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(3);
            const message = {
                type: 'test',
                to: alice.did,
                from: bob.did,
                id: 'test-jws-success',
                body: { hello: 'world' },
            };
            const packedMessage = yield agent.packDIDCommMessage({
                packing: 'jws',
                message,
            });
            const result = yield agent.sendDIDCommMessage({
                messageId: 'test-jws-success',
                packedMessage,
                recipientDidUrl: alice.did,
            });
            expect(result).toBeTruthy();
            expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith({ data: 'test-jws-success', type: 'DIDCommV2Message-sent' }, expect.anything());
            // in our case, it is the same agent that is receiving the messages
            expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith({
                data: {
                    message: {
                        body: { hello: 'world' },
                        from: bob.did,
                        id: 'test-jws-success',
                        to: alice.did,
                        type: 'test',
                    },
                    metaData: { packing: 'jws' },
                },
                type: 'DIDCommV2Message-received',
            }, expect.anything());
        }));
        it('should remove DIDComm service from receiver', () => __awaiter(void 0, void 0, void 0, function* () {
            var _x;
            const result = yield agent.didManagerRemoveService({
                did: alice.did,
                id: 'alice-didcomm-endpoint',
            });
            expect(result.substr(0, 2)).toEqual('0x');
            const resolution = yield agent.resolveDid({ didUrl: alice.did });
            expect(resolution === null || resolution === void 0 ? void 0 : resolution.didDocument).not.toBeNull();
            expect([...(((_x = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _x === void 0 ? void 0 : _x.service) || [])]).toEqual([]);
        }));
        it('should add DIDComm service to receiver DID with ServiceEndpoint as object', () => __awaiter(void 0, void 0, void 0, function* () {
            var _y, _z;
            const result = yield agent.didManagerAddService({
                did: alice.did,
                service: {
                    id: 'alice-didcomm-endpoint',
                    type: 'DIDCommMessaging',
                    serviceEndpoint: { uri: `http://localhost:${listeningPort}/messaging` },
                    description: 'handles DIDComm messages',
                },
            });
            expect(result.substr(0, 2)).toEqual('0x');
            const resolution = yield agent.resolveDid({ didUrl: alice.did });
            expect((_z = (_y = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _y === void 0 ? void 0 : _y.service) === null || _z === void 0 ? void 0 : _z[0].serviceEndpoint).toEqual({
                uri: `http://localhost:${listeningPort}/messaging`,
            });
        }));
        it('should send an signed message from bob to alice with ServiceEndpoint as object', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(3);
            const message = {
                type: 'test',
                to: alice.did,
                from: bob.did,
                id: 'test-jws-success',
                body: { hello: 'world' },
            };
            const packedMessage = yield agent.packDIDCommMessage({
                packing: 'jws',
                message,
            });
            const result = yield agent.sendDIDCommMessage({
                messageId: 'test-jws-success',
                packedMessage,
                recipientDidUrl: alice.did,
            });
            expect(result).toBeTruthy();
            expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith({ data: 'test-jws-success', type: 'DIDCommV2Message-sent' }, expect.anything());
            // in our case, it is the same agent that is receiving the messages
            expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith({
                data: {
                    message: {
                        body: { hello: 'world' },
                        from: bob.did,
                        id: 'test-jws-success',
                        to: alice.did,
                        type: 'test',
                    },
                    metaData: { packing: 'jws' },
                },
                type: 'DIDCommV2Message-received',
            }, expect.anything());
        }));
        it('should remove DIDComm service from receiver', () => __awaiter(void 0, void 0, void 0, function* () {
            var _0;
            const result = yield agent.didManagerRemoveService({
                did: alice.did,
                id: 'alice-didcomm-endpoint',
            });
            expect(result.substr(0, 2)).toEqual('0x');
            const resolution = yield agent.resolveDid({ didUrl: alice.did });
            expect(resolution === null || resolution === void 0 ? void 0 : resolution.didDocument).not.toBeNull();
            expect([...(((_0 = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _0 === void 0 ? void 0 : _0.service) || [])]).toEqual([]);
        }));
        it('should add DIDComm service to receiver DID with serviceEndpoint as array of ServiceEndpoint objects', () => __awaiter(void 0, void 0, void 0, function* () {
            var _1, _2;
            const result = yield agent.didManagerAddService({
                did: alice.did,
                service: {
                    id: 'alice-didcomm-endpoint',
                    type: 'DIDCommMessaging',
                    serviceEndpoint: [{ uri: `http://localhost:${listeningPort}/messaging` }],
                    description: 'handles DIDComm messages',
                },
            });
            expect(result.substr(0, 2)).toEqual('0x');
            const resolution = yield agent.resolveDid({ didUrl: alice.did });
            expect((_2 = (_1 = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _1 === void 0 ? void 0 : _1.service) === null || _2 === void 0 ? void 0 : _2[0].serviceEndpoint).toEqual([
                { uri: `http://localhost:${listeningPort}/messaging` },
            ]);
        }));
        it('should send an signed message from bob to alice with serviceEndpoint as array of ServiceEndpoint objects', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(3);
            const message = {
                type: 'test',
                to: alice.did,
                from: bob.did,
                id: 'test-jws-success',
                body: { hello: 'world' },
            };
            const packedMessage = yield agent.packDIDCommMessage({
                packing: 'jws',
                message,
            });
            const result = yield agent.sendDIDCommMessage({
                messageId: 'test-jws-success',
                packedMessage,
                recipientDidUrl: alice.did,
            });
            expect(result).toBeTruthy();
            expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith({ data: 'test-jws-success', type: 'DIDCommV2Message-sent' }, expect.anything());
            // in our case, it is the same agent that is receiving the messages
            expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith({
                data: {
                    message: {
                        body: { hello: 'world' },
                        from: bob.did,
                        id: 'test-jws-success',
                        to: alice.did,
                        type: 'test',
                    },
                    metaData: { packing: 'jws' },
                },
                type: 'DIDCommV2Message-received',
            }, expect.anything());
        }));
        it('should fail to pack an anoncrypt message from bob to alice (no receiver key)', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const message = {
                type: 'test',
                to: alice.did,
                from: bob.did,
                id: 'test-anoncrypt-fail',
                body: { hello: 'world' },
            };
            yield expect(agent.packDIDCommMessage({
                packing: 'anoncrypt',
                message,
            })).rejects.toThrowError(/^key_not_found: no key agreement keys found for recipient/);
        }));
        it('should add encryption key to receiver DID', () => __awaiter(void 0, void 0, void 0, function* () {
            var _3, _4, _5, _6, _7, _8;
            const newKey = yield agent.keyManagerCreate({
                kms: 'local',
                type: 'X25519',
            });
            const result = yield agent.didManagerAddKey({
                did: alice.did,
                key: newKey,
            });
            expect(result.substr(0, 2)).toEqual('0x');
            const resolution = yield agent.resolveDid({ didUrl: alice.did });
            const expectedBase58Key = u8a.toString(u8a.fromString(newKey.publicKeyHex, 'base16'), 'base58btc');
            expect((_4 = (_3 = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _3 === void 0 ? void 0 : _3.verificationMethod) === null || _4 === void 0 ? void 0 : _4[2].publicKeyBase58).toEqual(expectedBase58Key);
            expect((_6 = (_5 = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _5 === void 0 ? void 0 : _5.keyAgreement) === null || _6 === void 0 ? void 0 : _6[0]).toEqual((_8 = (_7 = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _7 === void 0 ? void 0 : _7.verificationMethod) === null || _8 === void 0 ? void 0 : _8[2].id);
        }));
        it('should send an anoncrypt message from bob to alice', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(3);
            const message = {
                type: 'test',
                to: alice.did,
                from: bob.did,
                id: 'test-anoncrypt-success',
                body: { hello: 'world' },
            };
            const packedMessage = yield agent.packDIDCommMessage({
                packing: 'anoncrypt',
                message,
            });
            const result = yield agent.sendDIDCommMessage({
                messageId: 'test-anoncrypt-success',
                packedMessage,
                recipientDidUrl: alice.did,
            });
            expect(result).toBeTruthy();
            expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith({ data: 'test-anoncrypt-success', type: 'DIDCommV2Message-sent' }, expect.anything());
            // in our case, it is the same agent that is receiving the messages
            expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith({
                data: {
                    message: {
                        body: { hello: 'world' },
                        from: 'did:ethr:ganache:0x02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5',
                        id: 'test-anoncrypt-success',
                        to: 'did:ethr:ganache:0x0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
                        type: 'test',
                    },
                    metaData: { packing: 'anoncrypt' },
                },
                type: 'DIDCommV2Message-received',
            }, expect.anything());
        }));
        it('should fail to send jws message from alice to bob (no service endpoint)', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const message = {
                type: 'test',
                to: bob.did,
                from: alice.did,
                id: 'test-endpoint-fail',
                body: { hello: 'world' },
            };
            const packedMessage = yield agent.packDIDCommMessage({
                packing: 'jws',
                message,
            });
            yield expect(agent.sendDIDCommMessage({
                messageId: 'test-endpoint-fail',
                packedMessage,
                recipientDidUrl: bob.did,
            })).rejects.toThrowError(/^not_found: could not find DIDComm Messaging service in DID document for/);
        }));
        it('should fail to pack an authcrypt message from bob to alice (no skid)', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const message = {
                type: 'test',
                to: alice.did,
                from: bob.did,
                id: 'test-authcrypt-fail',
                body: { hello: 'world' },
            };
            const packedMessage = yield expect(agent.packDIDCommMessage({
                packing: 'authcrypt',
                message,
            })).rejects.toThrowError(/^key_not_found: could not map an agent key to an skid for/);
        }));
        it('should add encryption key to sender DID', () => __awaiter(void 0, void 0, void 0, function* () {
            var _9, _10, _11, _12, _13, _14;
            const newKey = yield agent.keyManagerCreate({
                kms: 'local',
                type: 'X25519',
            });
            const result = yield agent.didManagerAddKey({
                did: bob.did,
                key: newKey,
            });
            expect(result.substr(0, 2)).toEqual('0x');
            const resolution = yield agent.resolveDid({ didUrl: bob.did });
            const expectedBase58Key = u8a.toString(u8a.fromString(newKey.publicKeyHex, 'base16'), 'base58btc');
            expect((_10 = (_9 = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _9 === void 0 ? void 0 : _9.verificationMethod) === null || _10 === void 0 ? void 0 : _10[2].publicKeyBase58).toEqual(expectedBase58Key);
            expect((_12 = (_11 = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _11 === void 0 ? void 0 : _11.keyAgreement) === null || _12 === void 0 ? void 0 : _12[0]).toEqual((_14 = (_13 = resolution === null || resolution === void 0 ? void 0 : resolution.didDocument) === null || _13 === void 0 ? void 0 : _13.verificationMethod) === null || _14 === void 0 ? void 0 : _14[2].id);
        }));
        it('should send an authcrypt message from bob to alice', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(3);
            const message = {
                type: 'test',
                to: alice.did,
                from: bob.did,
                id: 'test-authcrypt-success',
                body: { hello: 'world' },
            };
            const packedMessage = yield agent.packDIDCommMessage({
                packing: 'authcrypt',
                message,
            });
            const result = yield agent.sendDIDCommMessage({
                messageId: 'test-authcrypt-success',
                packedMessage,
                recipientDidUrl: alice.did,
            });
            expect(result).toBeTruthy();
            expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith({ data: 'test-authcrypt-success', type: 'DIDCommV2Message-sent' }, expect.anything());
            // in our case, it is the same agent that is receiving the messages
            expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith({
                data: {
                    message: {
                        body: { hello: 'world' },
                        from: bob.did,
                        id: 'test-authcrypt-success',
                        to: alice.did,
                        type: 'test',
                    },
                    metaData: { packing: 'authcrypt' },
                },
                type: 'DIDCommV2Message-received',
            }, expect.anything());
        }));
    });
};
