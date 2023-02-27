import { createAgent, IResolver } from '@veramo/core'
import {CredentialPlugin, ICredentialVerifier} from '@veramo/credential-w3c'
import {ICredentialIssuerLD} from '@veramo/credential-ld'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver, verificationMethodTypes } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'

// You will need to get a project ID from infura https://www.infura.io
const INFURA_PROJECT_ID = '33aab9e0334c44b0a2e0c57c15302608'

export const agent = createAgent<IResolver & ICredentialVerifier & ICredentialIssuerLD>({
  plugins: [
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
        ...webDidResolver(),
      }),
    }),

    new CredentialPlugin(),
  ],
})