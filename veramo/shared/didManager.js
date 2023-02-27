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
    describe('DID manager', () => {
        let agent;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield testContext.setup();
            agent = testContext.getAgent();
            return true;
        }));
        afterAll(testContext.tearDown);
        let identifier;
        it('should create identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            identifier = yield agent.didManagerCreate({
                provider: 'did:web',
                alias: 'example.com',
            });
            expect(identifier.provider).toEqual('did:web');
            expect(identifier.alias).toEqual('example.com');
            expect(identifier.did).toEqual('did:web:example.com');
            expect(identifier.keys.length).toEqual(1);
            expect(identifier.services.length).toEqual(0);
            expect(identifier.controllerKeyId).toEqual(identifier.keys[0].kid);
        }));
        it('should create identifier using did:ethr:arbitrum:rinkeby provider', () => __awaiter(void 0, void 0, void 0, function* () {
            identifier = yield agent.didManagerCreate({
                // this expects the `did:ethr` provider to matchPrefix and use the `arbitrum:rinkeby` network specifier
                provider: 'did:ethr:arbitrum:rinkeby',
            });
            expect(identifier.provider).toEqual('did:ethr:arbitrum:rinkeby');
            expect(identifier.did).toMatch(/^did:ethr:arbitrum:rinkeby:0x.*$/);
            expect(identifier.keys.length).toEqual(1);
            expect(identifier.services.length).toEqual(0);
            expect(identifier.controllerKeyId).toEqual(identifier.keys[0].kid);
        }));
        it('should create identifier using chainId 421611', () => __awaiter(void 0, void 0, void 0, function* () {
            identifier = yield agent.didManagerCreate({
                provider: 'did:ethr',
                options: {
                    // this expects the `did:ethr` provider to matchPrefix and use the `arbitrum:rinkeby` network specifier
                    // because the configured network has that name
                    network: 421611,
                },
            });
            expect(identifier.provider).toEqual('did:ethr');
            expect(identifier.did).toMatch(/^did:ethr:arbitrum:rinkeby:0x.*$/);
            expect(identifier.keys.length).toEqual(1);
            expect(identifier.services.length).toEqual(0);
            expect(identifier.controllerKeyId).toEqual(identifier.keys[0].kid);
        }));
        it('should throw error for existing alias provider combo', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(agent.didManagerCreate({
                provider: 'did:web',
                alias: 'example.com',
            })).rejects.toThrow('Identifier with alias: example.com, provider: did:web already exists');
        }));
        it('should get identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            const identifier2 = yield agent.didManagerGet({
                did: identifier.did,
            });
            expect(identifier2.did).toEqual(identifier.did);
        }));
        it('should throw error for non existing did', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(agent.didManagerGet({
                did: 'did:web:foobar',
            })).rejects.toThrow('Identifier not found');
        }));
        it('should get or create identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            const identifier3 = yield agent.didManagerGetOrCreate({
                alias: 'alice',
                provider: 'did:ethr:rinkeby',
            });
            const identifier4 = yield agent.didManagerGetOrCreate({
                alias: 'alice',
                provider: 'did:ethr:rinkeby',
            });
            expect(identifier3).toEqual(identifier4);
            const identifierKey1 = yield agent.didManagerGetOrCreate({
                alias: 'carol',
                provider: 'did:key',
            });
            const identifierKey2 = yield agent.didManagerGetOrCreate({
                alias: 'carol',
                provider: 'did:key',
            });
            expect(identifierKey1).toEqual(identifierKey2);
            const identifier5 = yield agent.didManagerGetOrCreate({
                alias: 'alice',
                provider: 'did:ethr',
            });
            expect(identifier5).not.toEqual(identifier4);
            const identifier6 = yield agent.didManagerGetByAlias({
                alias: 'alice',
                provider: 'did:ethr',
            });
            expect(identifier6).toEqual(identifier5);
            const identifier7 = yield agent.didManagerGetByAlias({
                alias: 'alice',
                // default provider is 'did:ethr:rinkeby'
            });
            expect(identifier7).toEqual(identifier4);
        }));
        it('should get identifiers', () => __awaiter(void 0, void 0, void 0, function* () {
            const allIdentifiers = yield agent.didManagerFind();
            expect(allIdentifiers.length).toBeGreaterThanOrEqual(5);
            const aliceIdentifiers = yield agent.didManagerFind({
                alias: 'alice',
            });
            expect(aliceIdentifiers.length).toEqual(2);
            const rinkebyIdentifiers = yield agent.didManagerFind({
                provider: 'did:ethr:rinkeby',
            });
            expect(rinkebyIdentifiers.length).toBeGreaterThanOrEqual(1);
            // Default provider 'did:ethr:rinkeby'
            yield agent.didManagerCreate({ provider: 'did:ethr:rinkeby' });
            const rinkebyIdentifiers2 = yield agent.didManagerFind({
                provider: 'did:ethr:rinkeby',
            });
            expect(rinkebyIdentifiers2.length).toEqual(rinkebyIdentifiers.length + 1);
        }));
        it('should delete identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            const allIdentifiers = yield agent.didManagerFind();
            const count = allIdentifiers.length;
            const result = yield agent.didManagerDelete({
                did: allIdentifiers[0].did,
            });
            expect(result).toEqual(true);
            const allIdentifiers2 = yield agent.didManagerFind();
            expect(allIdentifiers2.length).toEqual(count - 1);
            yield expect(agent.didManagerGet({
                did: allIdentifiers[0].did,
            })).rejects.toThrow('Identifier not found');
        }));
        it('should add service to identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            const webIdentifier = yield agent.didManagerGetOrCreate({
                alias: 'foobar.com',
                provider: 'did:web',
            });
            expect(webIdentifier.services.length).toEqual(0);
            const result = yield agent.didManagerAddService({
                did: webIdentifier.did,
                service: {
                    id: 'did:web:foobar.com#msg',
                    type: 'Messaging',
                    serviceEndpoint: 'https://foobar.com/messaging',
                    description: 'Handles incoming messages',
                },
            });
            expect(result).toEqual({ success: true });
            const webIdentifier2 = yield agent.didManagerGetOrCreate({
                alias: 'foobar.com',
                provider: 'did:web',
            });
            expect(webIdentifier2.services.length).toEqual(1);
            expect(webIdentifier2.services[0]).toEqual({
                id: 'did:web:foobar.com#msg',
                type: 'Messaging',
                serviceEndpoint: 'https://foobar.com/messaging',
                description: 'Handles incoming messages',
            });
        }));
        it('should remove service from identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield agent.didManagerRemoveService({
                did: 'did:web:foobar.com',
                id: 'did:web:foobar.com#msg',
            });
            expect(result).toEqual({ success: true });
            const webIdentifier = yield agent.didManagerGetOrCreate({
                alias: 'foobar.com',
                provider: 'did:web',
            });
            expect(webIdentifier.services.length).toEqual(0);
        }));
        it('should add key to identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            const webIdentifier = yield agent.didManagerGetOrCreate({
                alias: 'foobar.com',
                provider: 'did:web',
            });
            expect(webIdentifier.keys.length).toEqual(1);
            const newKey = yield agent.keyManagerCreate({
                kms: 'local',
                type: 'Secp256k1',
            });
            const result = yield agent.didManagerAddKey({
                did: webIdentifier.did,
                key: newKey,
            });
            expect(result).toEqual({ success: true });
            const webIdentifier2 = yield agent.didManagerGetOrCreate({
                alias: 'foobar.com',
                provider: 'did:web',
            });
            expect(webIdentifier2.keys.length).toEqual(2);
        }));
        it('should remove key from identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            const webIdentifier = yield agent.didManagerGet({
                did: 'did:web:foobar.com',
            });
            expect(webIdentifier.keys.length).toEqual(2);
            const result = yield agent.didManagerRemoveKey({
                did: 'did:web:foobar.com',
                kid: webIdentifier.keys[1].kid,
            });
            expect(result).toEqual({ success: true });
            const webIdentifier2 = yield agent.didManagerGet({
                did: 'did:web:foobar.com',
            });
            expect(webIdentifier2.keys.length).toEqual(1);
            expect(webIdentifier2.keys[0].kid).toEqual(webIdentifier.keys[0].kid);
        }));
        it('should import identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const did = 'did:web:imported.example';
            const imported = yield agent.didManagerImport({
                did,
                provider: 'did:web',
                services: [
                    {
                        id: `${did}#msg`,
                        type: 'Messaging',
                        serviceEndpoint: 'https://example.org/messaging',
                        description: 'Handles incoming messages',
                    },
                ],
                keys: [
                    {
                        kms: 'local',
                        privateKeyHex: 'e63886b5ba367dc2aff9acea6d955ee7c39115f12eaf2aa6b1a2eaa852036668',
                        type: 'Secp256k1',
                    },
                ],
            });
            expect(imported).toEqual({
                did,
                keys: [
                    {
                        kid: '04dd467afb12bdb797303e7f3f0c8cd0ba80d518dc4e339e0e2eb8f2d99a9415cac537854a30d31a854b7af0b4fcb54c3954047390fa9500d3cc2e15a3e09017bb',
                        kms: 'local',
                        meta: {
                            algorithms: [
                                'ES256K',
                                'ES256K-R',
                                'eth_signTransaction',
                                'eth_signTypedData',
                                'eth_signMessage',
                            ],
                        },
                        publicKeyHex: '04dd467afb12bdb797303e7f3f0c8cd0ba80d518dc4e339e0e2eb8f2d99a9415cac537854a30d31a854b7af0b4fcb54c3954047390fa9500d3cc2e15a3e09017bb',
                        type: 'Secp256k1',
                    },
                ],
                provider: 'did:web',
                services: [
                    {
                        description: 'Handles incoming messages',
                        id: `${did}#msg`,
                        serviceEndpoint: 'https://example.org/messaging',
                        type: 'Messaging',
                    },
                ],
            });
        }));
        it('should set alias for identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            const identifier = yield agent.didManagerCreate();
            const result = yield agent.didManagerSetAlias({
                did: identifier.did,
                alias: 'dave',
            });
            expect(result).toEqual(true);
            const identifier2 = yield agent.didManagerGetByAlias({
                alias: 'dave',
            });
            expect(identifier2).toEqual(Object.assign(Object.assign({}, identifier), { alias: 'dave' }));
        }));
    });
};
