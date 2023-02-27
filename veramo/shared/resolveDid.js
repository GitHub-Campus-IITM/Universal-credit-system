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
export default (testContext) => {
    describe('resolving didUrl', () => {
        let agent;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield testContext.setup();
            agent = testContext.getAgent();
            return true;
        }));
        afterAll(testContext.tearDown);
        it('should resolve didUrl', () => __awaiter(void 0, void 0, void 0, function* () {
            const didUrl = 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190';
            const didDoc = (yield agent.resolveDid({ didUrl })).didDocument;
            expect(didDoc === null || didDoc === void 0 ? void 0 : didDoc.id).toEqual(didUrl);
        }));
        it('should resolve did:key github #681', () => __awaiter(void 0, void 0, void 0, function* () {
            const didUrl = 'did:key:z6Mkk7yqnGF3YwTrLpqrW6PGsKci7dNqh1CjnvMbzrMerSeL';
            const result = yield agent.resolveDid({ didUrl });
            const didDoc = result.didDocument;
            expect(didDoc === null || didDoc === void 0 ? void 0 : didDoc.id).toEqual(didUrl);
            expect(result).toHaveProperty('didDocumentMetadata');
            expect(result).toHaveProperty('didResolutionMetadata');
        }));
        it('should resolve imported fake did', () => __awaiter(void 0, void 0, void 0, function* () {
            const did = 'did:fake:myfakedid';
            yield agent.didManagerImport({
                did,
                keys: [
                    {
                        type: 'Ed25519',
                        kid: 'fake-key-1',
                        publicKeyHex: '1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
                        privateKeyHex: 'b57103882f7c66512dc96777cbafbeb2d48eca1e7a867f5a17a84e9a6740f7dc1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
                        kms: 'local',
                    },
                ],
                services: [
                    {
                        id: 'fake-service-1',
                        type: 'fakeService',
                        serviceEndpoint: 'http://it.is.fake.all.the.way.down',
                    },
                ],
                provider: 'did:fake',
                alias: 'faker',
            });
            const resolved = yield agent.resolveDid({ didUrl: did });
            expect(resolved.didDocument).toEqual({
                id: did,
                service: [
                    {
                        id: 'did:fake:myfakedid#fake-service-1',
                        type: 'fakeService',
                        serviceEndpoint: 'http://it.is.fake.all.the.way.down',
                    },
                ],
                verificationMethod: [
                    {
                        type: 'Ed25519VerificationKey2018',
                        publicKeyHex: '1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
                        kms: 'local',
                        controller: 'did:fake:myfakedid',
                        id: 'did:fake:myfakedid#fake-key-1',
                    },
                ],
                keyAgreement: ['did:fake:myfakedid#fake-key-1'],
                authentication: ['did:fake:myfakedid#fake-key-1'],
                assertionMethod: ['did:fake:myfakedid#fake-key-1'],
            });
            expect(resolved).toHaveProperty('didDocumentMetadata');
            expect(resolved).toHaveProperty('didResolutionMetadata');
        }));
        it('should resolve created fake did', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const alias = 'allfake';
            const did = `did:fake:${alias}`;
            const createdDID = yield agent.didManagerCreate({ alias, provider: 'did:fake' });
            const modified = yield agent.didManagerAddService({
                did,
                service: { id: 'fake-service-x', type: 'FakeService', serviceEndpoint: 'none' },
            });
            const resolved = yield agent.resolveDid({ didUrl: did });
            expect((_a = resolved === null || resolved === void 0 ? void 0 : resolved.didDocument) === null || _a === void 0 ? void 0 : _a.service).toEqual([
                { id: `${did}#fake-service-x`, type: 'FakeService', serviceEndpoint: 'none' },
            ]);
        }));
        it('should return an error for unsupported did methods', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            yield expect(agent.resolveDid({ didUrl: 'did:foo:bar' })).resolves.toEqual({
                didDocument: null,
                didResolutionMetadata: { error: 'unsupportedDidMethod' },
                didDocumentMetadata: {},
            });
        }));
        it('should throw error when resolving garbage', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(3);
            //@ts-ignore
            yield expect(agent.resolveDid()).resolves.toEqual({
                didDocument: null,
                didDocumentMetadata: {},
                didResolutionMetadata: { error: 'invalidDid' },
            });
            //@ts-ignore
            yield expect(agent.resolveDid({})).resolves.toEqual({
                didDocument: null,
                didDocumentMetadata: {},
                didResolutionMetadata: { error: 'invalidDid' },
            });
            //@ts-ignore
            yield expect(agent.resolveDid({ didUrl: 'garbage' })).resolves.toEqual({
                didDocument: null,
                didDocumentMetadata: {},
                didResolutionMetadata: { error: 'invalidDid' },
            });
        }));
    });
    describe('resolving didUrl with validation', () => {
        let agent;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield testContext.setup({ schemaValidation: true });
            agent = testContext.getAgent({ schemaValidation: true });
            return true;
        }));
        afterAll(testContext.tearDown);
        it('should throw validation error', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(3);
            //@ts-ignore
            yield expect(agent.resolveDid()).rejects.toHaveProperty('name', 'ValidationError');
            //@ts-ignore
            yield expect(agent.resolveDid({})).rejects.toHaveProperty('name', 'ValidationError');
            //@ts-ignore
            yield expect(agent.resolveDid({ didUrl: 1 })).rejects.toHaveProperty('name', 'ValidationError');
        }));
    });
};
