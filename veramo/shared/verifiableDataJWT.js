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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { decodeJWT } from 'did-jwt';
import { VC_JWT_ERROR } from 'did-jwt-vc';
export default (testContext) => {
    describe('creating Verifiable Credentials in JWT', () => {
        let agent;
        let identifier;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield testContext.setup();
            agent = testContext.getAgent();
            identifier = yield agent.didManagerCreate({ kms: 'local', provider: 'did:key' });
        }));
        afterAll(testContext.tearDown);
        it('should create verifiable credential in JWT', () => __awaiter(void 0, void 0, void 0, function* () {
            const verifiableCredential = yield agent.createVerifiableCredential({
                credential: {
                    issuer: { id: identifier.did },
                    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://example.com/1/2/3'],
                    type: ['VerifiableCredential', 'Custom'],
                    issuanceDate: new Date().toISOString(),
                    credentialSubject: {
                        id: 'did:web:example.com',
                        you: 'Rock',
                    },
                },
                proofFormat: 'jwt',
            });
            expect(verifiableCredential).toHaveProperty('proof.jwt');
            expect(verifiableCredential['@context']).toEqual([
                'https://www.w3.org/2018/credentials/v1',
                'https://example.com/1/2/3',
            ]);
            expect(verifiableCredential['type']).toEqual(['VerifiableCredential', 'Custom']);
            const hash = yield agent.dataStoreSaveVerifiableCredential({ verifiableCredential });
            expect(typeof hash).toEqual('string');
            const verifiableCredential2 = yield agent.dataStoreGetVerifiableCredential({ hash });
            expect(verifiableCredential).toEqual(verifiableCredential2);
        }));
        it('should create verifiable credential (simple)', () => __awaiter(void 0, void 0, void 0, function* () {
            const verifiableCredential = yield agent.createVerifiableCredential({
                credential: {
                    issuer: { id: identifier.did },
                    type: ['Example'],
                    credentialSubject: {
                        id: 'did:web:example.com',
                        you: 'Rock',
                    },
                },
                proofFormat: 'jwt',
            });
            expect(verifiableCredential).toHaveProperty('proof.jwt');
            expect(verifiableCredential).toHaveProperty('issuanceDate');
            expect(verifiableCredential['@context']).toEqual(['https://www.w3.org/2018/credentials/v1']);
            expect(verifiableCredential['type']).toEqual(['VerifiableCredential', 'Example']);
            const token = verifiableCredential.proof.jwt;
            const { payload } = decodeJWT(token);
            expect(payload.vc.credentialSubject.id).not.toBeDefined();
        }));
        it('should create verifiable credential keeping original fields', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(5);
            const verifiableCredential = yield agent.createVerifiableCredential({
                credential: {
                    issuer: { id: identifier.did },
                    type: ['Example'],
                    credentialSubject: {
                        id: 'did:web:example.com',
                        you: 'Rock',
                    },
                },
                proofFormat: 'jwt',
                removeOriginalFields: false,
            });
            expect(verifiableCredential).toHaveProperty('proof.jwt');
            expect(verifiableCredential).toHaveProperty('issuanceDate');
            expect(verifiableCredential['@context']).toEqual(['https://www.w3.org/2018/credentials/v1']);
            expect(verifiableCredential['type']).toEqual(['VerifiableCredential', 'Example']);
            const token = verifiableCredential.proof.jwt;
            const { payload } = decodeJWT(token);
            expect(payload.vc.credentialSubject.id).toEqual('did:web:example.com');
        }));
        it('should create verifiable presentation', () => __awaiter(void 0, void 0, void 0, function* () {
            const verifiableCredential = yield agent.createVerifiableCredential({
                credential: {
                    issuer: { id: identifier.did },
                    '@context': ['https://www.w3.org/2018/credentials/v1'],
                    type: ['VerifiableCredential'],
                    issuanceDate: new Date().toISOString(),
                    credentialSubject: {
                        id: 'did:web:example.com',
                        you: 'Rock',
                    },
                },
                proofFormat: 'jwt',
            });
            const verifiablePresentation = yield agent.createVerifiablePresentation({
                presentation: {
                    holder: identifier.did,
                    verifier: [],
                    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://example.com/1/2/3'],
                    type: ['VerifiablePresentation', 'Custom'],
                    issuanceDate: new Date().toISOString(),
                    verifiableCredential: [verifiableCredential],
                },
                proofFormat: 'jwt',
            });
            expect(verifiablePresentation).toHaveProperty('proof.jwt');
            expect(verifiablePresentation['@context']).toEqual([
                'https://www.w3.org/2018/credentials/v1',
                'https://example.com/1/2/3',
            ]);
            expect(verifiablePresentation['type']).toEqual(['VerifiablePresentation', 'Custom']);
            const hash = yield agent.dataStoreSaveVerifiablePresentation({ verifiablePresentation });
            expect(typeof hash).toEqual('string');
            const verifiablePresentation2 = yield agent.dataStoreGetVerifiablePresentation({ hash });
            expect(verifiablePresentation).toEqual(verifiablePresentation2);
        }));
        it('should create verifiable presentation (simple)', () => __awaiter(void 0, void 0, void 0, function* () {
            const verifiableCredential = yield agent.createVerifiableCredential({
                credential: {
                    issuer: { id: identifier.did },
                    type: ['Example'],
                    credentialSubject: {
                        id: 'did:web:example.com',
                        you: 'Rock',
                    },
                },
                proofFormat: 'jwt',
            });
            const verifiablePresentation = yield agent.createVerifiablePresentation({
                presentation: {
                    holder: identifier.did,
                    type: ['Example'],
                    verifier: [],
                    verifiableCredential: [verifiableCredential],
                },
                proofFormat: 'jwt',
            });
            expect(verifiablePresentation).toHaveProperty('proof.jwt');
            expect(verifiablePresentation['@context']).toEqual(['https://www.w3.org/2018/credentials/v1']);
            expect(verifiablePresentation['type']).toEqual(['VerifiablePresentation', 'Example']);
            const hash = yield agent.dataStoreSaveVerifiablePresentation({ verifiablePresentation });
            expect(typeof hash).toEqual('string');
            const verifiablePresentation2 = yield agent.dataStoreGetVerifiablePresentation({ hash });
            expect(verifiablePresentation).toEqual(verifiablePresentation2);
            const token = verifiablePresentation.proof.jwt;
            const { payload } = decodeJWT(token);
            expect(payload.holder).not.toBeDefined();
        }));
        it('should create verifiable presentation (simple) keeping original fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const verifiableCredential = yield agent.createVerifiableCredential({
                credential: {
                    issuer: { id: identifier.did },
                    type: ['Example'],
                    credentialSubject: {
                        id: 'did:web:example.com',
                        you: 'Rock',
                    },
                },
                proofFormat: 'jwt',
            });
            const verifiablePresentation = yield agent.createVerifiablePresentation({
                presentation: {
                    holder: identifier.did,
                    type: ['Example'],
                    verifier: [],
                    verifiableCredential: [verifiableCredential],
                },
                proofFormat: 'jwt',
                removeOriginalFields: false,
            });
            expect(verifiablePresentation).toHaveProperty('proof.jwt');
            expect(verifiablePresentation['@context']).toEqual(['https://www.w3.org/2018/credentials/v1']);
            expect(verifiablePresentation['type']).toEqual(['VerifiablePresentation', 'Example']);
            const token = verifiablePresentation.proof.jwt;
            const { payload } = decodeJWT(token);
            expect(payload.holder).toEqual(identifier.did);
        }));
        it('should query for credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            const allCredentials = yield agent.dataStoreORMGetVerifiableCredentials({});
            expect(allCredentials[0]).toHaveProperty('hash');
            expect(allCredentials[0]).toHaveProperty('verifiableCredential');
            const credentialCount = yield agent.dataStoreORMGetVerifiableCredentialsCount();
            expect(allCredentials.length).toEqual(credentialCount);
        }));
        it('should query for presentations', () => __awaiter(void 0, void 0, void 0, function* () {
            const allPresentations = yield agent.dataStoreORMGetVerifiablePresentations({});
            expect(allPresentations[0]).toHaveProperty('hash');
            expect(allPresentations[0]).toHaveProperty('verifiablePresentation');
            const presentationCount = yield agent.dataStoreORMGetVerifiablePresentationsCount();
            expect(allPresentations.length).toEqual(presentationCount);
        }));
        it('should throw error for non existing verifiable credential', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(agent.dataStoreGetVerifiableCredential({
                hash: 'foobar',
            })).rejects.toThrow('Verifiable credential not found');
        }));
        it('should throw error for non existing verifiable presentation', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(agent.dataStoreGetVerifiablePresentation({
                hash: 'foobar',
            })).rejects.toThrow('Verifiable presentation not found');
        }));
        describe('using testvectors', () => {
            const importedDID = {
                did: 'did:ethr:rinkeby:0x03155ee0cbefeecd80de63a62b4ed8f0f97ac22a58f76a265903b9acab79bf018c',
                provider: 'did:ethr:rinkeby',
                controllerKeyId: '04155ee0cbefeecd80de63a62b4ed8f0f97ac22a58f76a265903b9acab79bf018c7037e2bd897812170c92a4c978d6a10481491a37299d74c4bd412a111a4ac875',
                keys: [
                    {
                        kid: '04155ee0cbefeecd80de63a62b4ed8f0f97ac22a58f76a265903b9acab79bf018c7037e2bd897812170c92a4c978d6a10481491a37299d74c4bd412a111a4ac875',
                        kms: 'local',
                        type: 'Secp256k1',
                        publicKeyHex: '04155ee0cbefeecd80de63a62b4ed8f0f97ac22a58f76a265903b9acab79bf018c7037e2bd897812170c92a4c978d6a10481491a37299d74c4bd412a111a4ac875',
                        privateKeyHex: '31d1ec15ff8110442012fef0d1af918c0e09b2e2ab821bba52ecc85f8655ec63',
                    },
                ],
                services: [],
            };
            beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
                yield agent.didManagerImport(importedDID);
            }));
            it('signs JWT with ES256K', () => __awaiter(void 0, void 0, void 0, function* () {
                const credentialInput = {
                    credentialSubject: { id: 'did:example:subject', name: 'Alice' },
                    issuer: { id: importedDID.did },
                    type: ['Example'],
                };
                const _a = yield agent.createVerifiableCredential({
                    credential: credentialInput,
                    proofFormat: 'jwt',
                    save: false,
                    removeOriginalFields: true,
                }), { proof, issuanceDate } = _a, comparableOutput = __rest(_a, ["proof", "issuanceDate"]);
                expect(comparableOutput).toEqual({
                    credentialSubject: { name: 'Alice', id: 'did:example:subject' },
                    issuer: {
                        id: 'did:ethr:rinkeby:0x03155ee0cbefeecd80de63a62b4ed8f0f97ac22a58f76a265903b9acab79bf018c',
                    },
                    type: ['VerifiableCredential', 'Example'],
                    '@context': ['https://www.w3.org/2018/credentials/v1'],
                });
            }));
        });
        describe('credential verification policies', () => {
            let credential;
            beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
                const issuanceDate = '2019-08-19T09:15:20.000Z'; // 1566206120
                const expirationDate = '2019-08-20T10:42:31.000Z'; // 1566297751
                credential = yield agent.createVerifiableCredential({
                    proofFormat: 'jwt',
                    credential: {
                        issuer: identifier.did,
                        issuanceDate,
                        expirationDate,
                        credentialSubject: {
                            hello: 'world',
                        },
                    },
                });
            }));
            it('can verify credential at a particular time', () => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                const result = yield agent.verifyCredential({ credential });
                expect(result.verified).toBe(false);
                expect((_a = result === null || result === void 0 ? void 0 : result.error) === null || _a === void 0 ? void 0 : _a.errorCode).toEqual(VC_JWT_ERROR.INVALID_JWT);
                const result2 = yield agent.verifyCredential({
                    credential,
                    policies: { now: 1566297000 },
                });
                expect(result2.verified).toBe(true);
            }));
            it('can override expiry check', () => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield agent.verifyCredential({
                    credential,
                    policies: { expirationDate: false },
                });
                expect(result.verified).toBe(true);
            }));
            it('can override issuance check', () => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield agent.verifyCredential({
                    credential,
                    policies: { issuanceDate: false, now: 1565000000 },
                });
                expect(result.verified).toBe(true);
            }));
            it('can override audience check', () => __awaiter(void 0, void 0, void 0, function* () {
                var _b;
                const cred = yield agent.createVerifiableCredential({
                    proofFormat: 'jwt',
                    credential: {
                        issuer: identifier.did,
                        aud: 'override me',
                        credentialSubject: {
                            hello: 'world',
                        },
                    },
                });
                const result = yield agent.verifyCredential({ credential: cred });
                expect(result.verified).toBe(false);
                expect((_b = result.error) === null || _b === void 0 ? void 0 : _b.errorCode).toEqual(VC_JWT_ERROR.INVALID_AUDIENCE);
                const result2 = yield agent.verifyCredential({ credential: cred, policies: { audience: false } });
                expect(result2.verified).toBe(true);
            }));
            it('can override credentialStatus check', () => __awaiter(void 0, void 0, void 0, function* () {
                const cred = yield agent.createVerifiableCredential({
                    proofFormat: 'jwt',
                    credential: {
                        issuer: identifier.did,
                        credentialSubject: {
                            hello: 'world',
                        },
                        credentialStatus: {
                            id: 'override me',
                            type: 'ThisMethodDoesNotExist2022',
                        },
                    },
                });
                yield expect(agent.verifyCredential({ credential: cred })).rejects.toThrow(/^invalid_setup:/);
                const result2 = yield agent.verifyCredential({
                    credential: cred,
                    policies: { credentialStatus: false },
                });
                expect(result2.verified).toBe(true);
            }));
        });
        describe('presentation verification policies', () => {
            let credential;
            let presentation;
            beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
                const issuanceDate = '2019-08-19T09:15:20.000Z'; // 1566206120
                const expirationDate = '2019-08-20T10:42:31.000Z'; // 1566297751
                credential = yield agent.createVerifiableCredential({
                    proofFormat: 'jwt',
                    credential: {
                        issuer: identifier.did,
                        credentialSubject: {
                            hello: 'world',
                        },
                    },
                });
                presentation = yield agent.createVerifiablePresentation({
                    proofFormat: 'jwt',
                    presentation: {
                        holder: identifier.did,
                        verifiableCredential: [credential],
                        issuanceDate,
                        expirationDate,
                    },
                });
            }));
            it('can verify presentation at a particular time', () => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                const result = yield agent.verifyPresentation({ presentation });
                expect(result.verified).toBe(false);
                expect((_a = result === null || result === void 0 ? void 0 : result.error) === null || _a === void 0 ? void 0 : _a.errorCode).toEqual(VC_JWT_ERROR.INVALID_JWT);
                const result2 = yield agent.verifyPresentation({
                    presentation,
                    policies: { now: 1566297000 },
                });
                expect(result2.verified).toBe(true);
            }));
            it('can override expiry check', () => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield agent.verifyPresentation({
                    presentation,
                    policies: { expirationDate: false },
                });
                expect(result.verified).toBe(true);
            }));
            it('can override issuance check', () => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield agent.verifyPresentation({
                    presentation,
                    policies: { issuanceDate: false, now: 1565000000 },
                });
                expect(result.verified).toBe(true);
            }));
            it('can override audience check', () => __awaiter(void 0, void 0, void 0, function* () {
                var _b;
                const pres = yield agent.createVerifiablePresentation({
                    proofFormat: 'jwt',
                    presentation: {
                        holder: identifier.did,
                        verifiableCredential: [credential],
                    },
                    challenge: '1234',
                    domain: 'example.com',
                });
                const result = yield agent.verifyPresentation({ presentation: pres });
                expect(result.verified).toBe(false);
                expect((_b = result.error) === null || _b === void 0 ? void 0 : _b.errorCode).toEqual(VC_JWT_ERROR.INVALID_AUDIENCE);
                const result2 = yield agent.verifyPresentation({
                    presentation: pres,
                    policies: { audience: false },
                });
                expect(result2.verified).toBe(true);
            }));
        });
    });
};
