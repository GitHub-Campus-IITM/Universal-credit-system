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
    describe('creating Verifiable Credentials in EIP712', () => {
        let agent;
        let identifier;
        let verifiableCredential;
        let verifiablePresentation;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield testContext.setup();
            agent = testContext.getAgent();
        }));
        afterAll(testContext.tearDown);
        it('should create identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            identifier = yield agent.didManagerCreate({ kms: 'local' });
            expect(identifier).toHaveProperty('did');
            expect((_b = (_a = identifier === null || identifier === void 0 ? void 0 : identifier.keys[0]) === null || _a === void 0 ? void 0 : _a.meta) === null || _b === void 0 ? void 0 : _b.algorithms).toContain('eth_signTypedData');
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
        it('should verify credential with EthereumEip712Signature2021 proof type', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield agent.verifyCredentialEIP712({
                credential: verifiableCredential,
            });
            expect(result).toEqual(true);
        }));
        it('should create verifiable presentation with EthereumEip712Signature2021 proof type', () => __awaiter(void 0, void 0, void 0, function* () {
            const jwt_vc = 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiRGlzY29yZFJvbGUiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsiZGlzY29yZFVzZXJJZCI6IjQxMjgxNDQ4NjMzMjg5OTMzOCIsImRpc2NvcmRVc2VyTmFtZSI6IkFnbmVzIHwgQ29sbGFiLkxhbmQjMjYyMyIsImRpc2NvcmRVc2VyQXZhdGFyIjoiaHR0cHM6Ly9jZG4uZGlzY29yZGFwcC5jb20vYXZhdGFycy80MTI4MTQ0ODYzMzI4OTkzMzgvMTRmMDIwZWY3NTZhMzcyODQyODFlYmJiYThlYTg0YTkud2VicCIsImRpc2NvcmRHdWlsZElkIjoiOTQzMjU2MzA4MTcyMzQ1NDA1IiwiZGlzY29yZEd1aWxkTmFtZSI6IkNvbGxhYkxhbmQgVkMgR2F0ZWQgU2VydmVyIiwiZGlzY29yZEd1aWxkQXZhdGFyIjoiaHR0cHM6Ly9jZG4uZGlzY29yZGFwcC5jb20vaWNvbnMvOTQzMjU2MzA4MTcyMzQ1NDA1L2ZlMmVhMzBkZWIyZTMzMjQyNjVhZGY0Y2U3N2NjZWU2LndlYnAiLCJkaXNjb3JkUm9sZUlkIjoiOTQzMjU4OTY3MDUwNzAyODY5IiwiZGlzY29yZFJvbGVOYW1lIjoiQ29sbGFiTGFuZCBQYXRyb24iLCJkZXNjcmlwdGlvbiI6IkFnbmVzIHwgQ29sbGFiLkxhbmQjMjYyMyBoYXMgcm9sZSBDb2xsYWJMYW5kIFBhdHJvbiBpbiBEaXNjb3JkIGNvbW11bml0eSBDb2xsYWJMYW5kIFZDIEdhdGVkIFNlcnZlciJ9fSwic3ViIjoiNDEyODE0NDg2MzMyODk5MzM4IiwianRpIjoiMDIwMDQ0ZWQtMzkyYi00YjIwLThmY2MtYzgxYWNkNjQzYjc4IiwibmJmIjoxNjQ3MDE5MDgzLCJpc3MiOiJkaWQ6ZXRocjpyaW5rZWJ5OjB4MDJlM2RhMGFjN2VkZmJkNzViYjU1M2Y0YzYxODAxODVjNjQ2ODVkYzhjOWI1ZDBiOTBiZTlmMzdhNzE2MzkzZjNhIn0.N0j805D0Wiwv3hnd8S5sHdRpketHHCmth7G5bVuU4QFX03iwH1dclFD01bbmI3TXnfcLANpQhCINSJDAd9My5g';
            verifiablePresentation = yield agent.createVerifiablePresentation({
                presentation: {
                    holder: identifier.did,
                    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://example.com/1/2/3'],
                    type: ['VerifiablePresentation', 'Custom'],
                    issuanceDate: new Date().toISOString(),
                    verifiableCredential: [jwt_vc],
                },
                proofFormat: 'EthereumEip712Signature2021',
            });
            expect(verifiablePresentation).toHaveProperty('proof.proofValue');
            expect(verifiablePresentation['@context']).toEqual([
                'https://www.w3.org/2018/credentials/v1',
                'https://example.com/1/2/3',
            ]);
            expect(verifiablePresentation['type']).toEqual(['VerifiablePresentation', 'Custom']);
            const hash = yield agent.dataStoreSaveVerifiablePresentation({ verifiablePresentation });
            expect(typeof hash).toEqual('string');
            const vp2 = yield agent.dataStoreGetVerifiablePresentation({ hash });
            expect(verifiablePresentation).toEqual(vp2);
        }));
        it.todo('should throw error when trying to sign presentation with unsuported attributes');
        it('should verify presentation with EthereumEip712Signature2021 proof type', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield agent.verifyPresentationEIP712({
                presentation: verifiablePresentation,
            });
            expect(result).toEqual(true);
        }));
    });
};
