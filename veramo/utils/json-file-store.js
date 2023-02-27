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
import * as fs from 'fs';
/**
 * A utility class that shows how a File based JSON storage system could work.
 * This is not recommended for large databases since every write operation rewrites the entire database.
 */
export class JsonFileStore {
    constructor(file) {
        this.file = file;
        this.notifyUpdate = (oldState, newState) => __awaiter(this, void 0, void 0, function* () {
            yield this.save(newState);
        });
        this.dids = {};
        this.keys = {};
        this.privateKeys = {};
        this.credentials = {};
        this.claims = {};
        this.presentations = {};
        this.messages = {};
    }
    static fromFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const store = new JsonFileStore(file);
            return yield store.load();
        });
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkFile();
            const rawCache = yield fs.promises.readFile(this.file, { encoding: 'utf8' });
            let cache;
            try {
                cache = JSON.parse(rawCache);
            }
            catch (e) {
                cache = {};
            }
            ;
            ({
                dids: this.dids,
                keys: this.keys,
                credentials: this.credentials,
                claims: this.claims,
                presentations: this.presentations,
                messages: this.messages,
                privateKeys: this.privateKeys,
            } = Object.assign({ dids: {}, keys: {}, credentials: {}, claims: {}, presentations: {}, messages: {}, privateKeys: {} }, cache));
            return this;
        });
    }
    save(newState) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs.promises.writeFile(this.file, JSON.stringify(newState), {
                encoding: 'utf8',
            });
        });
    }
    checkFile() {
        return __awaiter(this, void 0, void 0, function* () {
            const file = yield fs.promises.open(this.file, 'w+');
            yield file.close();
        });
    }
}
