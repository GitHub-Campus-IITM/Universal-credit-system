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
const DIDCommEventSniffer = {
    eventTypes: ['DIDCommV2Message-sent', 'DIDCommV2Message-received'],
    onEvent: jest.fn(),
};
export default (testContext) => {
    describe('DID comm using did:fake flow', () => {
        let agent;
        let sender;
        let receiver;
        beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
            yield testContext.setup({ plugins: [DIDCommEventSniffer] });
            agent = testContext.getAgent();
            sender = yield agent.didManagerImport({
                did: 'did:fake:z6MkgbqNU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo',
                keys: [
                    {
                        type: 'Ed25519',
                        kid: 'didcomm-senderKey-1',
                        publicKeyHex: '1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
                        privateKeyHex: 'b57103882f7c66512dc96777cbafbeb2d48eca1e7a867f5a17a84e9a6740f7dc1fe9b397c196ab33549041b29cf93be29b9f2bdd27322f05844112fad97ff92a',
                        kms: 'local',
                    },
                ],
                services: [
                    {
                        id: 'msg1',
                        type: 'DIDCommMessaging',
                        serviceEndpoint: 'http://localhost:3002/messaging',
                    },
                ],
                provider: 'did:fake',
                alias: 'sender',
            });
            receiver = yield agent.didManagerImport({
                did: 'did:fake:z6MkrPhffVLBZpxH7xvKNyD4sRVZeZsNTWJkLdHdgWbfgNu3',
                keys: [
                    {
                        type: 'Ed25519',
                        kid: 'didcomm-receiverKey-1',
                        publicKeyHex: 'b162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636',
                        privateKeyHex: '19ed9b6949cfd0f9a57e30f0927839a985fa699491886ebcdda6a954d869732ab162e405b6485eff8a57932429b192ec4de13c06813e9028a7cdadf0e2703636',
                        kms: 'local',
                    },
                ],
                services: [
                    {
                        id: 'msg2',
                        type: 'DIDCommMessaging',
                        serviceEndpoint: 'http://localhost:3002/messaging',
                    },
                ],
                provider: 'did:fake',
                alias: 'receiver',
            });
            return true;
        }));
        afterAll(testContext.tearDown);
        it('should send a message', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(3);
            const message = {
                type: 'test',
                to: receiver.did,
                from: sender.did,
                id: 'test',
                body: { hello: 'world' },
            };
            const packedMessage = yield agent.packDIDCommMessage({
                packing: 'authcrypt',
                message,
            });
            const result = yield agent.sendDIDCommMessage({
                messageId: '123',
                packedMessage,
                recipientDidUrl: receiver.did,
            });
            expect(result).toBeTruthy();
            expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith({ data: '123', type: 'DIDCommV2Message-sent' }, expect.anything());
            // in our case, it is the same agent that is receiving the messages
            expect(DIDCommEventSniffer.onEvent).toHaveBeenCalledWith({
                data: {
                    message: {
                        body: { hello: 'world' },
                        from: 'did:fake:z6MkgbqNU4uF9NKSz5BqJQ4XKVHuQZYcUZP8pXGsJC8nTHwo',
                        id: 'test',
                        to: 'did:fake:z6MkrPhffVLBZpxH7xvKNyD4sRVZeZsNTWJkLdHdgWbfgNu3',
                        type: 'test',
                    },
                    metaData: { packing: 'authcrypt' },
                },
                type: 'DIDCommV2Message-received',
            }, expect.anything());
        }));
    });
};
