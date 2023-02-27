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
    describe('DID discovery', () => {
        let agent;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield testContext.setup({ context: { dbName: 'did-discovery-test' } });
            agent = testContext.getAgent();
            return true;
        }));
        afterAll(testContext.tearDown);
        it('should discover did by alias', () => __awaiter(void 0, void 0, void 0, function* () {
            const identifier = yield agent.didManagerGetOrCreate({
                alias: 'alice',
            });
            const result = yield agent.discoverDid({ query: 'alice' });
            expect(result.results[0].matches[0]).toEqual({
                did: identifier.did,
                metaData: {
                    alias: 'alice',
                },
            });
        }));
        it('should discover did by profile vc', () => __awaiter(void 0, void 0, void 0, function* () {
            const identifier = yield agent.didManagerCreate({});
            const verifiableCredential = yield agent.createVerifiableCredential({
                credential: {
                    issuer: { id: identifier.did },
                    '@context': ['https://www.w3.org/2018/credentials/v1'],
                    type: ['VerifiableCredential', 'Profile'],
                    issuanceDate: new Date().toISOString(),
                    credentialSubject: {
                        id: identifier.did,
                        name: 'bobby',
                    },
                },
                proofFormat: 'jwt',
                save: true,
            });
            const result = yield agent.discoverDid({ query: 'bobby' });
            expect(result.results[0].matches[0]).toEqual({
                did: identifier.did,
                metaData: { verifiableCredential },
            });
        }));
        it('should discover did by alias and profile vc', () => __awaiter(void 0, void 0, void 0, function* () {
            const identifier = yield agent.didManagerGetOrCreate({
                alias: 'bob',
            });
            const verifiableCredential = yield agent.createVerifiableCredential({
                credential: {
                    issuer: { id: identifier.did },
                    '@context': ['https://www.w3.org/2018/credentials/v1'],
                    type: ['VerifiableCredential', 'Profile'],
                    issuanceDate: new Date().toISOString(),
                    credentialSubject: {
                        id: identifier.did,
                        name: 'bobby',
                    },
                },
                proofFormat: 'jwt',
                save: true,
            });
            const result = yield agent.discoverDid({ query: 'bob' });
            expect(result.results).toHaveLength(2);
            expect(result.results[0].matches).toHaveLength(1);
            expect(result.results[1].matches).toHaveLength(3);
            expect(result.results[0].matches[0]).toEqual({
                did: identifier.did,
                metaData: {
                    alias: 'bob',
                },
            });
            expect(result.results[1].matches[1]).toEqual({
                did: identifier.did,
                metaData: { verifiableCredential },
            });
            expect(result.results[1].matches[2]).toEqual({
                did: identifier.did,
                metaData: {
                    alias: 'bob',
                },
            });
            const byDIDFragmentResult = yield agent.discoverDid({
                query: identifier.did.substring(3, identifier.did.length - 3),
            });
            expect(byDIDFragmentResult.results).toHaveLength(1);
            expect(byDIDFragmentResult.results[0].matches).toHaveLength(2);
            expect(byDIDFragmentResult.results[0].matches[1]).toEqual({
                did: identifier.did,
                metaData: {
                    alias: 'bob',
                },
            });
        }));
        it('should return errors', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield agent.discoverDid({ query: 'broken' });
            expect(result.errors['broken-discovery']).toMatch(/test_error/);
        }));
    });
};
