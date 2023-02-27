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
    describe('handling sdr message', () => {
        let agent;
        let identifier;
        let JWT;
        let originalRequestSender;
        let sdr;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield testContext.setup();
            agent = testContext.getAgent();
        }));
        afterAll(testContext.tearDown);
        it('should create identifier', () => __awaiter(void 0, void 0, void 0, function* () {
            identifier = yield agent.didManagerCreate({ kms: 'local' });
            expect(identifier).toHaveProperty('did');
        }));
        it('should create verifiable credential', () => __awaiter(void 0, void 0, void 0, function* () {
            const verifiableCredential = yield agent.createVerifiableCredential({
                credential: {
                    issuer: { id: identifier.did },
                    '@context': ['https://www.w3.org/2018/credentials/v1'],
                    type: ['VerifiableCredential'],
                    issuanceDate: new Date().toISOString(),
                    credentialSubject: {
                        id: 'did:web:uport.me',
                        you: 'Rock',
                    },
                },
                proofFormat: 'jwt',
            });
            expect(verifiableCredential).toHaveProperty('proof.jwt');
        }));
        it('should save an SDR message', () => __awaiter(void 0, void 0, void 0, function* () {
            JWT = yield agent.createSelectiveDisclosureRequest({
                data: {
                    issuer: identifier.did,
                    tag: 'sdr-one',
                    claims: [
                        {
                            reason: 'We need it',
                            claimType: 'name',
                            essential: true,
                        },
                    ],
                },
            });
            const message = yield agent.handleMessage({
                raw: JWT,
                save: true,
            });
            if (message.from) {
                originalRequestSender = message.from;
            }
            expect(message.raw).toEqual(JWT);
        }));
        it('should be able to find the request message', () => __awaiter(void 0, void 0, void 0, function* () {
            const messages = yield agent.dataStoreORMGetMessages();
            expect(messages[0].raw).toEqual(JWT);
            expect(messages[0].type).toEqual('sdr');
        }));
        it('should be able to sign a credential after saving a message', () => __awaiter(void 0, void 0, void 0, function* () {
            const identifiers = yield agent.didManagerFind();
            const identifier = identifiers[0];
            expect(identifiers[0].did).toBeDefined();
            const verifiableCredential = yield agent.createVerifiableCredential({
                credential: {
                    issuer: { id: identifier.did },
                    '@context': ['https://www.w3.org/2018/credentials/v1'],
                    type: ['VerifiableCredential'],
                    issuanceDate: new Date().toISOString(),
                    credentialSubject: {
                        id: 'did:web:uport.me',
                        name: 'Carrot',
                    },
                },
                proofFormat: 'jwt',
                save: true,
            });
            expect(verifiableCredential.proof.jwt).toBeDefined();
        }));
        it('should accept empty issuers array', () => __awaiter(void 0, void 0, void 0, function* () {
            const credentials = yield agent.getVerifiableCredentialsForSdr({
                sdr: {
                    claims: [
                        {
                            claimType: 'name',
                            issuers: [],
                        },
                    ],
                },
            });
            expect(credentials[0].credentials[0]).toHaveProperty('hash');
            expect(credentials[0].credentials[0]).toHaveProperty('verifiableCredential.proof');
        }));
        it('should create verifiable presentation', () => __awaiter(void 0, void 0, void 0, function* () {
            const credentials = yield agent.getVerifiableCredentialsForSdr({
                sdr: {
                    claims: [
                        {
                            claimType: 'name',
                        },
                    ],
                },
            });
            const verifiablePresentation = yield agent.createVerifiablePresentation({
                presentation: {
                    verifier: [originalRequestSender],
                    holder: identifier.did,
                    '@context': ['https://www.w3.org/2018/credentials/v1'],
                    type: ['VerifiablePresentation'],
                    issuanceDate: new Date().toISOString(),
                    verifiableCredential: credentials[0].credentials.map((c) => c.verifiableCredential),
                },
                proofFormat: 'jwt',
                save: true,
            });
            expect(verifiablePresentation).toHaveProperty('proof.jwt');
            const validated = yield agent.validatePresentationAgainstSdr({
                presentation: verifiablePresentation,
                sdr: {
                    issuer: '',
                    claims: [
                        {
                            claimType: 'name',
                        },
                    ],
                },
            });
            expect(validated.valid).toEqual(true);
        }));
    });
};
