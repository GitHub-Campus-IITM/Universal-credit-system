var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Web3Provider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
export function createEthersProvider() {
    const privateKeyHex = '0x1da6847600b0ee25e9ad9a52abbd786dd2502fa4005dd5af9310b7cc7a3b25db';
    const wallet = new Wallet(privateKeyHex);
    const mockProvider = new MockWeb3Provider(wallet);
    const provider = new Web3Provider(mockProvider);
    return provider;
}
class MockWeb3Provider {
    constructor(wallet) {
        this.wallet = wallet;
    }
    request(request) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (request.method) {
                case 'personal_sign':
                    //@ts-ignore
                    return this.wallet.signMessage(request.params[1]);
                    break;
                case 'eth_signTypedData_v4':
                    //@ts-ignore
                    const { domain, types, message } = JSON.parse(request.params[1]);
                    delete (types.EIP712Domain);
                    return this.wallet._signTypedData(domain, types, message);
                    break;
                default:
                    throw Error(`not_available: method ${request.method}`);
            }
        });
    }
}
