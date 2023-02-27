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
import { extractIssuer } from '../../packages/utils/src';
export default (testContext) => {
    describe('when database is initialized', () => {
        describe('using sqlite and synchronize=true', () => {
            createTestsUsingOptions({
                context: {
                    databaseFile: 'sqlite-sync-init-test.sqlite',
                    dbConnectionOptions: {
                        name: 'sqlite-sync-init-test',
                        type: 'sqlite',
                        synchronize: true,
                        migrationsRun: false,
                    },
                },
            });
        });
        describe('using sqlite and migrations', () => {
            createTestsUsingOptions({
                context: {
                    databaseFile: 'sqlite-migration-init-test.sqlite',
                    dbConnectionOptions: {
                        name: 'sqlite-migration-init-test',
                        type: 'sqlite',
                        synchronize: false,
                        migrationsRun: true,
                    },
                },
            });
        });
        if (process.env.INCLUDE_POSTGRES_TESTS === 'true') {
            // //docker run -p 5432:5432 -it --rm -e POSTGRES_PASSWORD=test123 postgres
            describe('using postgres and migrations', () => {
                createTestsUsingOptions({
                    context: {
                        dbConnectionOptions: {
                            name: 'postgres-migration-init-test',
                            type: 'postgres',
                            database: undefined,
                            synchronize: false,
                            migrationsRun: true,
                            host: process.env.POSTGRES_HOST || 'localhost',
                            port: process.env.POSTGRES_PORT || 5432,
                            password: process.env.POSTGRES_PASSWORD || 'test123',
                            username: process.env.POSTGRES_USER || 'postgres',
                        },
                    },
                });
            });
            describe('using postgres and sync', () => {
                createTestsUsingOptions({
                    context: {
                        dbConnectionOptions: {
                            name: 'postgres-sync-init-test',
                            type: 'postgres',
                            database: undefined,
                            synchronize: true,
                            migrationsRun: false,
                            host: process.env.POSTGRES_HOST || 'localhost',
                            port: process.env.POSTGRES_PORT || 5432,
                            password: process.env.POSTGRES_PASSWORD || 'test123',
                            username: process.env.POSTGRES_USER || 'postgres',
                        },
                    },
                });
            });
        }
        function createTestsUsingOptions(options) {
            describe('agent', () => {
                let agent;
                beforeAll(() => __awaiter(this, void 0, void 0, function* () {
                    yield testContext.setup(options);
                    agent = testContext.getAgent();
                    return true;
                }));
                afterAll(testContext.tearDown);
                let identifier;
                it('should create DID', () => __awaiter(this, void 0, void 0, function* () {
                    identifier = yield agent.didManagerGetOrCreate({ provider: 'did:fake', alias: 'migrationDID' });
                    expect(identifier.did).toMatch(/did:fake:.*/);
                }));
                it('should create and add key', () => __awaiter(this, void 0, void 0, function* () {
                    const key = yield agent.keyManagerCreate({
                        type: 'Ed25519',
                        kms: 'local',
                    });
                    yield agent.didManagerAddKey({
                        did: identifier.did,
                        key: key,
                    });
                    identifier = yield agent.didManagerGet({ did: identifier.did });
                    expect(identifier.keys.length).toBeGreaterThanOrEqual(2);
                }));
                it('should add service', () => __awaiter(this, void 0, void 0, function* () {
                    yield agent.didManagerAddService({
                        did: identifier.did,
                        service: {
                            id: 'fake-service',
                            type: 'DIDCommMessaging',
                            serviceEndpoint: 'http://localhost:6123',
                        },
                    });
                    identifier = yield agent.didManagerGet({ did: identifier.did });
                    expect(identifier.services.length).toBe(1);
                }));
                let credentialRaw;
                it('should sign and save credential', () => __awaiter(this, void 0, void 0, function* () {
                    const credential = yield agent.createVerifiableCredential({
                        proofFormat: 'jwt',
                        credential: {
                            credentialSubject: { id: identifier.did, pseudonym: 'FakeAlice' },
                            type: ['Example'],
                            issuer: identifier.did,
                        },
                    });
                    const credentialId = yield agent.dataStoreSaveVerifiableCredential({
                        verifiableCredential: credential,
                    });
                    const retrieved = yield agent.dataStoreGetVerifiableCredential({
                        hash: credentialId,
                    });
                    credentialRaw = retrieved.proof.jwt;
                    expect(extractIssuer(retrieved)).toEqual(identifier.did);
                }));
                let packedMessage;
                it('should pack anon message', () => __awaiter(this, void 0, void 0, function* () {
                    packedMessage = yield agent.packDIDCommMessage({
                        packing: 'authcrypt',
                        message: {
                            to: identifier.did,
                            from: identifier.did,
                            id: 'test-message-123',
                            type: 'w3c.vc',
                            body: credentialRaw,
                        },
                    });
                    expect(packedMessage.message.length).toBeGreaterThan(0);
                }));
                it('should unpack anon message', () => __awaiter(this, void 0, void 0, function* () {
                    const msg = yield agent.handleMessage({ raw: packedMessage.message });
                    expect(msg.type).toBe('w3c.vc');
                }));
                it('should get credentials from message by claim', () => __awaiter(this, void 0, void 0, function* () {
                    const incomingCredential = yield agent.createVerifiableCredential({
                        proofFormat: 'jwt',
                        credential: {
                            type: ['Example'],
                            credentialSubject: {
                                incoming: 'yes',
                            },
                            issuer: identifier.did,
                        },
                        save: false,
                    });
                    const message = yield agent.handleMessage({ raw: incomingCredential.proof.jwt, save: false });
                    const msgId = yield agent.dataStoreSaveMessage({ message });
                    const retrievedCredential = yield agent.dataStoreORMGetVerifiableCredentialsByClaims({
                        where: [{ column: 'type', value: ['incoming'] }],
                    });
                    expect(retrievedCredential.length).toBeGreaterThan(0);
                }));
            });
        }
    });
};
