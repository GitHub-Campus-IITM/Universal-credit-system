import { agent } from './veramo/setup'

async function main() {
  const issuerDID = await agent.didManagerGetByAlias({ alias: 'default' })
  const subjectDID = await agent.didManagerGetByAlias({ alias: 'CFI' })


  const verifiableCredential = await agent.createVerifiableCredential({
    credential: {
      issuer: { id: issuerDID.did },
      credentialSubject: {
        id: subjectDID.did,
        RollNo: 'AA00A0000',
        course: 'Functions in Several Variables',
        Grade: 'C',
        Name: 'Alpha',
        Age: '25',
        City: 'Chennai'
      },
    },
    proofFormat: 'EthereumEip712Signature2021',
  })
  console.log(`New credential created`)
  console.log(JSON.stringify(verifiableCredential, null, 2))
}

main().catch(console.log)