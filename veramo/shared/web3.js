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
    describe('web3', () => {
        let agent;
        let identifier;
        let verifiableCredential;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield testContext.setup();
            agent = testContext.getAgent();
            return true;
        }));
        afterAll(testContext.tearDown);
        it('should import ethers did', () => __awaiter(void 0, void 0, void 0, function* () {
            const account = `0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1`;
            const did = `did:ethr:${account}`;
            const controllerKeyId = `ethers-${account}`;
            identifier = yield agent.didManagerImport({
                did,
                provider: 'did:ethr',
                controllerKeyId,
                keys: [
                    {
                        kid: controllerKeyId,
                        type: 'Secp256k1',
                        kms: 'web3',
                        privateKeyHex: '',
                        publicKeyHex: '',
                        meta: {
                            account,
                            provider: 'ethers',
                            algorithms: ['eth_signMessage', 'eth_signTypedData'],
                        },
                    },
                ],
            });
        }));
        it('should sign a message', () => __awaiter(void 0, void 0, void 0, function* () {
            if (identifier.controllerKeyId) {
                const signature = yield agent.keyManagerSign({
                    data: 'Hello world',
                    keyRef: identifier.controllerKeyId,
                    algorithm: 'eth_signMessage',
                });
                expect(signature).toBeTruthy();
            }
        }));
        it('should create verifiable credential with EthereumEip712Signature2021 proof type', () => __awaiter(void 0, void 0, void 0, function* () {
            verifiableCredential = yield agent.createVerifiableCredential({
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
                proofFormat: 'EthereumEip712Signature2021',
            });
            expect(verifiableCredential).toHaveProperty('proof.proofValue');
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
    });
};
