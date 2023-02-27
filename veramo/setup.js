"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.agent = void 0;
// Core interfaces
var core_1 = require("@veramo/core");
// Core identity manager plugin
var did_manager_1 = require("@veramo/did-manager");
// Ethr did identity provider
var did_provider_ethr_1 = require("@veramo/did-provider-ethr");
// Core key manager plugin
var key_manager_1 = require("@veramo/key-manager");
// Custom key management system for RN
var kms_local_1 = require("@veramo/kms-local");
// W3C Verifiable Credential plugin
var credential_w3c_1 = require("@veramo/credential-w3c");
// Custom resolvers
var did_resolver_1 = require("@veramo/did-resolver");
var did_resolver_2 = require("did-resolver");
var ethr_did_resolver_1 = require("ethr-did-resolver");
var web_did_resolver_1 = require("web-did-resolver");
// Storage plugin using TypeOrm
var data_store_1 = require("@veramo/data-store");
// TypeORM is installed with `@veramo/data-store`
var typeorm_1 = require("typeorm");
// This will be the name for the local sqlite database for demo purposes
var DATABASE_FILE = 'database.sqlite';
// You will need to get a project ID from infura https://www.infura.io
var INFURA_PROJECT_ID = 'ee376705129e4330b655026fae0c9d00';
// This will be the secret key for the KMS
var KMS_SECRET_KEY = '6470ddc83aa30db6ce5f44155fba2809b02742bb25956a168591aa6367e8af71';
var dbConnection = new typeorm_1.DataSource({
    type: 'sqlite',
    database: DATABASE_FILE,
    synchronize: false,
    migrations: data_store_1.migrations,
    migrationsRun: true,
    logging: ['error', 'info', 'warn'],
    entities: data_store_1.Entities
}).initialize();
exports.agent = (0, core_1.createAgent)({
    plugins: [
        new key_manager_1.KeyManager({
            store: new data_store_1.KeyStore(dbConnection),
            kms: {
                local: new kms_local_1.KeyManagementSystem(new data_store_1.PrivateKeyStore(dbConnection, new kms_local_1.SecretBox(KMS_SECRET_KEY)))
            }
        }),
        new did_manager_1.DIDManager({
            store: new data_store_1.DIDStore(dbConnection),
            defaultProvider: 'did:ethr:goerli',
            providers: {
                'did:ethr:goerli': new did_provider_ethr_1.EthrDIDProvider({
                    defaultKms: 'local',
                    network: 'goerli',
                    rpcUrl: 'https://goerli.infura.io/v3/' + INFURA_PROJECT_ID
                })
            }
        }),
        new did_resolver_1.DIDResolverPlugin({
            resolver: new did_resolver_2.Resolver(__assign(__assign({}, (0, ethr_did_resolver_1.getResolver)({ infuraProjectId: INFURA_PROJECT_ID })), (0, web_did_resolver_1.getResolver)()))
        }),
        new credential_w3c_1.CredentialPlugin(),
    ]
});
