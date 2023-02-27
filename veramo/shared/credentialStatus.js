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
import { CredentialStatusPlugin } from '../../packages/credential-status/src';
// Constant used to simulate exception flows
const simulateStatusVerificationFailure = 'Any unexpected failure during status verification.';
// Constant used to simulate revoked credentials
const simulateRevokedCredential = 'A revoked credential.';
// Constant used to simulate revoked credentials
const simulateNotRevokedCredential = 'A NOT revoked credential.';
const callsCounter = jest.fn();
const checkStatus = (credential) => __awaiter(void 0, void 0, void 0, function* () {
    callsCounter();
    if (credential.credentialStatus.id === simulateStatusVerificationFailure) {
        // Simulates the exception flows where the credential status verification
        // can't be executed for and unexpected reason, like network failures.
        throw new Error(simulateStatusVerificationFailure);
    }
    const revoked = credential.credentialStatus.id === simulateRevokedCredential;
    if (!revoked && credential.credentialStatus.id !== simulateNotRevokedCredential) {
        throw new Error('Invalid state.');
    }
    return { revoked };
});
export default (testContext) => {
    describe('Credential status verification (revocation)', () => {
        let agent;
        let identifier;
        let rawCredential;
        let rawRevoked;
        let rawFailure;
        let rawUnknown;
        // Clean the number of times the methos was called in the previosu test
        beforeEach(callsCounter.mockReset);
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield testContext.setup({
                plugins: [
                    new CredentialStatusPlugin({
                        ExoticStatusMethod2022: checkStatus,
                    }),
                ],
            });
            agent = testContext.getAgent();
            identifier = yield agent.didManagerCreate({ kms: 'local' });
            rawCredential = buildCredential(identifier, {
                type: 'ExoticStatusMethod2022',
                id: simulateNotRevokedCredential,
            });
            rawRevoked = buildCredential(identifier, {
                type: 'ExoticStatusMethod2022',
                id: simulateRevokedCredential,
            });
            rawUnknown = buildCredential(identifier, {
                type: 'UnknownType',
                id: 'any',
            });
            rawFailure = buildCredential(identifier, {
                type: 'ExoticStatusMethod2022',
                id: simulateStatusVerificationFailure,
            });
            return true;
        }));
        afterAll(testContext.tearDown);
        it('should check credentialStatus for JWT credential', () => __awaiter(void 0, void 0, void 0, function* () {
            const vc = yield agent.createVerifiableCredential({
                credential: rawCredential,
                proofFormat: 'jwt',
            });
            expect(vc).toHaveProperty('proof.jwt');
            const result = yield agent.verifyCredential({ credential: vc });
            expect(callsCounter).toHaveBeenCalledTimes(1);
            expect(result.verified).toEqual(true);
        }));
        it('should check credentialStatus for revoked JWT credential', () => __awaiter(void 0, void 0, void 0, function* () {
            const vc = yield agent.createVerifiableCredential({
                credential: rawRevoked,
                proofFormat: 'jwt',
            });
            expect(vc).toHaveProperty('proof.jwt');
            const result = yield agent.verifyCredential({ credential: vc });
            expect(callsCounter).toHaveBeenCalledTimes(1);
            expect(result.verified).toEqual(false);
        }));
        it('should fail checking credentialStatus with exception during verification', () => __awaiter(void 0, void 0, void 0, function* () {
            const vc = yield agent.createVerifiableCredential({
                credential: rawFailure,
                proofFormat: 'jwt',
            });
            expect(vc).toHaveProperty('proof.jwt');
            yield expect(agent.verifyCredential({ credential: vc })).rejects.toThrow(simulateStatusVerificationFailure);
            expect(callsCounter).toHaveBeenCalledTimes(1);
        }));
        it('should fail checking credentialStatus when agent doesn`t have the status type', () => __awaiter(void 0, void 0, void 0, function* () {
            const vc = yield agent.createVerifiableCredential({
                credential: rawUnknown,
                proofFormat: 'jwt',
            });
            expect(vc).toHaveProperty('proof.jwt');
            yield expect(agent.verifyCredential({ credential: vc })).rejects.toThrow(`unknown_method: credentialStatus method UnknownType unknown. Validity can not be determined.`);
            expect(callsCounter).toHaveBeenCalledTimes(0);
        }));
        it('should check credentialStatus for JSON-LD credential', () => __awaiter(void 0, void 0, void 0, function* () {
            const vc = yield agent.createVerifiableCredential({
                credential: rawCredential,
                proofFormat: 'lds',
            });
            expect(vc).toHaveProperty('proof.jws');
            const result = yield agent.verifyCredential({ credential: vc });
            expect(callsCounter).toHaveBeenCalledTimes(1);
            expect(result.verified).toEqual(true);
        }));
        it('should check credentialStatus for revoked JSON-LD credential', () => __awaiter(void 0, void 0, void 0, function* () {
            const vc = yield agent.createVerifiableCredential({
                credential: rawRevoked,
                proofFormat: 'lds',
            });
            expect(vc).toHaveProperty('proof.jws');
            const result = yield agent.verifyCredential({ credential: vc });
            expect(callsCounter).toHaveBeenCalledTimes(1);
            expect(result.verified).toEqual(false);
        }));
        it('should check credentialStatus for EIP712 credential', () => __awaiter(void 0, void 0, void 0, function* () {
            const vc = yield agent.createVerifiableCredential({
                credential: rawCredential,
                proofFormat: 'EthereumEip712Signature2021',
            });
            expect(vc).toHaveProperty('proof.proofValue');
            const result = yield agent.verifyCredential({ credential: vc });
            expect(callsCounter).toHaveBeenCalledTimes(1);
            expect(result.verified).toEqual(true);
        }));
        it('should check credentialStatus for revoked EIP712 credential', () => __awaiter(void 0, void 0, void 0, function* () {
            const vc = yield agent.createVerifiableCredential({
                credential: rawRevoked,
                proofFormat: 'EthereumEip712Signature2021',
            });
            expect(vc).toHaveProperty('proof.proofValue');
            const result = yield agent.verifyCredential({ credential: vc });
            expect(callsCounter).toHaveBeenCalledTimes(1);
            expect(result.verified).toEqual(false);
        }));
    });
    describe('Credential status verification (revocation) without status plugin', () => {
        let agent;
        let identifier;
        let rawCredential;
        // Clean the number of times the methos was called in the previosu test
        beforeEach(callsCounter.mockReset);
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield testContext.setup({
                plugins: [],
            });
            agent = testContext.getAgent();
            identifier = yield agent.didManagerCreate({ kms: 'local' });
            rawCredential = {
                issuer: { id: identifier.did },
                '@context': ['https://www.w3.org/2018/credentials/v1', 'https://veramo.io/contexts/profile/v1'],
                type: ['VerifiableCredential', 'Profile'],
                issuanceDate: new Date().toISOString(),
                credentialSubject: {
                    name: 'Better trust layers with Veramo!',
                },
                credentialStatus: {
                    type: 'ExoticStatusMethod2022',
                    id: simulateNotRevokedCredential,
                },
            };
        }));
        afterAll(testContext.tearDown);
        it('should fail on credentialStatus check when agent has no status plugin', () => __awaiter(void 0, void 0, void 0, function* () {
            const vc = yield agent.createVerifiableCredential({
                credential: rawCredential,
                proofFormat: 'jwt',
            });
            expect(vc).toHaveProperty('proof.jwt');
            // TODO It`s an exception flow an it'd be better to throw an exception instead of returning false
            yield expect(agent.verifyCredential({ credential: vc })).rejects.toThrow(`invalid_setup: The credential status can't be verified because there is no ICredentialStatusVerifier plugin installed.`);
        }));
    });
};
function buildCredential(identifier, credentialStatus) {
    return {
        issuer: { id: identifier.did },
        '@context': ['https://www.w3.org/2018/credentials/v1', 'https://veramo.io/contexts/profile/v1'],
        type: ['VerifiableCredential', 'Profile'],
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
            name: 'Better trust layers with Veramo!',
        },
        credentialStatus,
    };
}
