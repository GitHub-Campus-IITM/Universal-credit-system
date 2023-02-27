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
    describe('Save credentials and query by claim type', () => {
        let agent;
        let identifier;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield testContext.setup();
            agent = testContext.getAgent();
        }));
        afterAll(testContext.tearDown);
        it('should create identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            identifier = yield agent.didManagerCreate({ kms: 'local' });
            expect(identifier).toHaveProperty('did');
        }));
        it('should create verifiable credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            // Looping these in a map/forEach throws SQL UNIQUE CONSTRAINT errors
            yield agent.createVerifiableCredential({
                credential: {
                    issuer: { id: identifier.did },
                    '@context': ['https://www.w3.org/2018/credentials/v1'],
                    type: ['VerifiableCredential'],
                    issuanceDate: new Date().toISOString(),
                    credentialSubject: {
                        id: identifier.did,
                        topic: 'math',
                    },
                },
                proofFormat: 'jwt',
                save: true,
            });
            yield agent.createVerifiableCredential({
                credential: {
                    issuer: { id: identifier.did },
                    '@context': ['https://www.w3.org/2018/credentials/v1'],
                    type: ['VerifiableCredential'],
                    issuanceDate: new Date().toISOString(),
                    credentialSubject: {
                        id: identifier.did,
                        topic: 'science',
                    },
                },
                proofFormat: 'jwt',
                save: true,
            });
            yield agent.createVerifiableCredential({
                credential: {
                    issuer: { id: identifier.did },
                    '@context': ['https://www.w3.org/2018/credentials/v1'],
                    type: ['VerifiableCredential'],
                    issuanceDate: new Date().toISOString(),
                    credentialSubject: {
                        id: identifier.did,
                        topic: 'art',
                    },
                },
                proofFormat: 'jwt',
                save: true,
            });
        }));
        it('should be able to find all the credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            const credentials = yield agent.dataStoreORMGetVerifiableCredentials({
                where: [{ column: 'issuer', value: [identifier.did] }],
            });
            expect(credentials).toHaveLength(3);
        }));
        it('should be able to find all the credentials when query by claim type', () => __awaiter(void 0, void 0, void 0, function* () {
            const credentials = yield agent.dataStoreORMGetVerifiableCredentialsByClaims({
                where: [{ column: 'type', value: ['topic'] }],
            });
            expect(credentials).toHaveLength(3);
            const count = yield agent.dataStoreORMGetVerifiableCredentialsByClaimsCount({
                where: [{ column: 'type', value: ['topic'] }],
            });
            expect(count).toEqual(credentials.length);
        }));
        it('should be able to find all the credentials when query by claim type and value', () => __awaiter(void 0, void 0, void 0, function* () {
            const credentials = yield agent.dataStoreORMGetVerifiableCredentialsByClaims({
                where: [
                    { column: 'type', value: ['topic'] },
                    { column: 'value', value: ['math', 'art'] },
                ],
            });
            expect(credentials).toHaveLength(2);
        }));
        it('should be able to delete credential', () => __awaiter(void 0, void 0, void 0, function* () {
            const findOptions = { where: [{ column: 'issuer', value: [identifier.did] }] };
            const credentials = yield agent.dataStoreORMGetVerifiableCredentials(findOptions);
            expect(credentials).toHaveLength(3);
            const result = yield agent.dataStoreDeleteVerifiableCredential({ hash: credentials[0].hash });
            expect(result).toEqual(true);
            const credentials2 = yield agent.dataStoreORMGetVerifiableCredentials(findOptions);
            expect(credentials2).toHaveLength(2);
        }));
    });
};
