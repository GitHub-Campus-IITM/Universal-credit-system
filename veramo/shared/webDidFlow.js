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
    describe('web did flow', () => {
        let agent;
        let serviceIdentifier;
        let serviceIdentifierKey;
        let alice;
        let bob;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield testContext.setup();
            agent = testContext.getAgent();
        }));
        afterAll(testContext.tearDown);
        it('should create service identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            serviceIdentifier = yield agent.didManagerGetOrCreate({
                provider: 'did:web',
                alias: 'webdidflow.example.com',
            });
            expect(serviceIdentifier.provider).toEqual('did:web');
            expect(serviceIdentifier.alias).toEqual('webdidflow.example.com');
            expect(serviceIdentifier.did).toEqual('did:web:webdidflow.example.com');
            serviceIdentifierKey = serviceIdentifier.keys[0];
        }));
        it('should add service endpoint', () => __awaiter(void 0, void 0, void 0, function* () {
            const service = {
                id: 'did:web:webdidflow.example.com#1',
                type: 'Messaging',
                description: 'Post any RAW message here',
                serviceEndpoint: 'https://example.com/messaging',
            };
            yield agent.didManagerAddService({
                did: 'did:web:webdidflow.example.com',
                service,
            });
            const testIdentifier = yield agent.didManagerGet({ did: 'did:web:webdidflow.example.com' });
            expect(testIdentifier.services[0]).toEqual(service);
        }));
        it('should get existing service identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            const testIdentifier = yield agent.didManagerGetOrCreate({
                provider: 'did:web',
                alias: 'webdidflow.example.com',
            });
            expect(testIdentifier.keys[0]).toEqual(serviceIdentifierKey);
            expect(testIdentifier.provider).toEqual('did:web');
            expect(testIdentifier.alias).toEqual('webdidflow.example.com');
            expect(testIdentifier.did).toEqual('did:web:webdidflow.example.com');
        }));
        it('should create identifier with alias: alice', () => __awaiter(void 0, void 0, void 0, function* () {
            alice = yield agent.didManagerGetOrCreate({
                alias: 'alice',
                provider: 'did:ethr:rinkeby',
            });
            expect(alice.provider).toEqual('did:ethr:rinkeby');
            expect(alice.alias).toEqual('alice');
            expect(alice.did).toBeDefined();
        }));
        it('should create identifier with alias: bob', () => __awaiter(void 0, void 0, void 0, function* () {
            bob = yield agent.didManagerGetOrCreate({
                alias: 'bob',
                provider: 'did:ethr:rinkeby',
            });
            expect(bob.provider).toEqual('did:ethr:rinkeby');
            expect(bob.alias).toEqual('bob');
            expect(bob.did).toBeDefined();
        }));
        it('should query identifiers', () => __awaiter(void 0, void 0, void 0, function* () {
            const identifiers = yield agent.didManagerFind();
            expect(identifiers.length).toBeGreaterThanOrEqual(3);
        }));
        describe('should create verifiable credential', () => {
            it('issuer: serviceIdentifier', () => __awaiter(void 0, void 0, void 0, function* () {
                const verifiableCredential = yield agent.createVerifiableCredential({
                    save: true,
                    credential: {
                        issuer: { id: serviceIdentifier.did },
                        '@context': ['https://www.w3.org/2018/credentials/v1'],
                        type: ['VerifiableCredential', 'Profile'],
                        issuanceDate: new Date().toISOString(),
                        credentialSubject: {
                            id: alice.did,
                            name: 'Alice',
                        },
                    },
                    proofFormat: 'jwt',
                });
                expect(verifiableCredential.issuer).toEqual({ id: serviceIdentifier.did });
                expect(verifiableCredential.credentialSubject).toEqual({ id: alice.did, name: 'Alice' });
                expect(verifiableCredential).toHaveProperty('proof.jwt');
            }));
            it('issuer - Alice, subject - Bob', () => __awaiter(void 0, void 0, void 0, function* () {
                const a = yield agent.didManagerGetOrCreate({
                    alias: 'alice',
                });
                const b = yield agent.didManagerGetOrCreate({
                    alias: 'bob',
                });
                const verifiableCredential = yield agent.createVerifiableCredential({
                    save: true,
                    credential: {
                        issuer: { id: a.did },
                        '@context': ['https://www.w3.org/2018/credentials/v1'],
                        type: ['VerifiableCredential'],
                        issuanceDate: new Date().toISOString(),
                        credentialSubject: {
                            id: b.did,
                            name: 'Bob',
                        },
                    },
                    proofFormat: 'jwt',
                });
                expect(verifiableCredential.issuer).toEqual({ id: alice.did });
                expect(verifiableCredential.credentialSubject).toEqual({ id: bob.did, name: 'Bob' });
                expect(verifiableCredential).toHaveProperty('proof.jwt');
            }));
            it('should be able to query credentials', () => __awaiter(void 0, void 0, void 0, function* () {
                const credentials = yield agent.dataStoreORMGetVerifiableCredentials({
                    where: [
                        { column: 'subject', value: [alice.did], op: 'Equal' },
                        { column: 'type', value: ['VerifiableCredential,Profile'], op: 'Equal' },
                    ],
                    order: [{ column: 'issuanceDate', direction: 'DESC' }],
                });
                expect(credentials.length).toEqual(1);
            }));
        });
    });
};
