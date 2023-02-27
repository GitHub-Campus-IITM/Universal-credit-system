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
import { getChainIdForDidEthr, mapIdentifierKeysToDoc, resolveDidOrThrow } from '../../packages/utils/src';
export default (testContext) => {
    describe('utilities', () => {
        let agent;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield testContext.setup();
            agent = testContext.getAgent();
            return true;
        }));
        afterAll(testContext.tearDown);
        it('should get chainId for ethr did', () => __awaiter(void 0, void 0, void 0, function* () {
            const didUrl = 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190';
            const didDoc = yield resolveDidOrThrow(didUrl, { agent });
            if (didDoc.verificationMethod) {
                const chainId = getChainIdForDidEthr(didDoc.verificationMethod[0]);
                expect(chainId).toEqual(4);
            }
        }));
        it('should map identifier keys to did doc', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const account = `0xb09b66026ba5909a7cfe99b76875431d2b8d5190`;
            const did = `did:ethr:0x4:${account}`;
            const controllerKeyId = `metamask-${account}`;
            yield agent.didManagerImport({
                did,
                provider: 'did:ethr:rinkeby',
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
                            provider: 'metamask',
                            algorithms: ['eth_signMessage', 'eth_signTypedData'],
                        },
                    },
                ],
            });
            const identifier = yield agent.didManagerGet({ did });
            const extendedKeys = yield mapIdentifierKeysToDoc(identifier, 'verificationMethod', { agent });
            expect((_b = (_a = extendedKeys[0].meta.verificationMethod) === null || _a === void 0 ? void 0 : _a.blockchainAccountId) === null || _b === void 0 ? void 0 : _b.toLocaleLowerCase()).toEqual(`eip155:4:${account}`);
        }));
    });
};
