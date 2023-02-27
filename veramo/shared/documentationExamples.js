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
    describe('Documentation examples', () => {
        let agent;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield testContext.setup();
            agent = testContext.getAgent();
        }));
        afterAll(testContext.tearDown);
        //DO NOT EDIT MANUALLY START
        it('core-IResolver-getDIDComponentById example', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const did = 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190';
            const didFragment = `${did}#controller`;
            const fragment = yield agent.getDIDComponentById({
                didDocument: (_a = (yield agent.resolveDid({ didUrl: did }))) === null || _a === void 0 ? void 0 : _a.didDocument,
                didUrl: didFragment,
                section: 'authentication',
            });
            expect(fragment).toEqual({
                id: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190#controller',
                type: 'EcdsaSecp256k1RecoveryMethod2020',
                controller: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190',
                blockchainAccountId: 'eip155:4:0xb09B66026bA5909A7CFE99b76875431D2b8D5190',
            });
        }));
        it('core-IResolver-resolveDid example', () => __awaiter(void 0, void 0, void 0, function* () {
            const doc = yield agent.resolveDid({
                didUrl: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190',
            });
            expect(doc.didDocument).toEqual({
                '@context': [
                    'https://www.w3.org/ns/did/v1',
                    'https://w3id.org/security/suites/secp256k1recovery-2020/v2',
                ],
                id: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190',
                verificationMethod: [
                    {
                        id: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190#controller',
                        type: 'EcdsaSecp256k1RecoveryMethod2020',
                        controller: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190',
                        blockchainAccountId: 'eip155:4:0xb09B66026bA5909A7CFE99b76875431D2b8D5190',
                    },
                ],
                authentication: ['did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190#controller'],
                assertionMethod: ['did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190#controller'],
            });
        }));
        it('core-IDIDManager-didManagerCreate example', () => __awaiter(void 0, void 0, void 0, function* () {
            const identifier = yield agent.didManagerCreate({
                alias: 'charlie',
                provider: 'did:ethr:rinkeby',
                kms: 'local',
            });
        }));
        it('core-IDIDManager-didManagerFind example', () => __awaiter(void 0, void 0, void 0, function* () {
            const aliceIdentifiers = yield agent.didManagerFind({
                alias: 'alice',
            });
            const rinkebyIdentifiers = yield agent.didManagerFind({
                provider: 'did:ethr:rinkeby',
            });
        }));
        it('core-IDIDManager-didManagerGetByAlias example', () => __awaiter(void 0, void 0, void 0, function* () {
            const identifier = yield agent.didManagerGetByAlias({
                alias: 'charlie',
                provider: 'did:ethr:rinkeby',
            });
        }));
        it('core-IDIDManager-didManagerSetAlias example', () => __awaiter(void 0, void 0, void 0, function* () {
            const identifier = yield agent.didManagerCreate();
            const result = yield agent.didManagerSetAlias({
                did: identifier.did,
                alias: 'carol',
            });
        }));
        it('did-comm-IDIDComm-getDIDCommMessageMediaType example', () => __awaiter(void 0, void 0, void 0, function* () {
            undefined;
        }));
        //DO NOT EDIT MANUALLY END
    });
};
