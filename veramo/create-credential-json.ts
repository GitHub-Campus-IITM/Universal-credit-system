import { agent } from './veramo/setup'

async function main() {
  const issuerDID = await agent.didManagerGetByAlias({ alias: 'default' });
  const subjectDID = await agent.didManagerGetByAlias({ alias: 'CFI' });
  let omega = 'A00A0000'

  console.log(issuerDID)
  console.log(issuerDID.did)

  const credential = await agent.createVerifiableCredential({
    credential: {
      issuer: { id: 'did:ethr:goerli:0x03ba0a0eeb5f854f9a3318e067c21d76e3cb0ed406aaef3027a7bd71e9b7e40a3d' },
      credentialSubject: {
        id: subjectDID.did,
        RollNo: omega,
      },
    },
    proofFormat: 'jwt',
  });
  
  const verifiableCredential = {credential: credential}

  console.log(`New credential created`);
  const credentialString = JSON.stringify(verifiableCredential)

  console.log(credentialString);

  // const finalCredential = JSON.parse(credentialString)

  // const result = await agent.verifyCredential(finalCredential)

  // console.log(result);
  
}

main().catch(console.log)