import { agent } from './veramo/setup'





async function main() {

  const jsonString = '{"credential":{"credentialSubject":{"RollNo":"AA00A0000","id":"did:ethr:goerli:0x03bbe111dc9d0cb60ad85bad8ab1d461c727f7aae11a8dff370e40682868af230d"},"issuer":{"id":"did:ethr:goerli:0x03ba0a0eeb5f854f9a3318e067c21d76e3cb0ed406aaef3027a7bd71e9b7e40a3d"},"type":["VerifiableCredential"],"@context":["https://www.w3.org/2018/credentials/v1"],"issuanceDate":"2023-01-10T15:47:22.000Z","proof":{"type":"JwtProof2020","jwt":"iyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7IlJvbGxObyI6IkFBMDBBMDAwMCJ9fSwic3ViIjoiZGlkOmV0aHI6Z29lcmxpOjB4MDNiYmUxMTFkYzlkMGNiNjBhZDg1YmFkOGFiMWQ0NjFjNzI3ZjdhYWUxMWE4ZGZmMzcwZTQwNjgyODY4YWYyMzBkIiwibmJmIjoxNjczMzY1NjQyLCJpc3MiOiJkaWQ6ZXRocjpnb2VybGk6MHgwM2JhMGEwZWViNWY4NTRmOWEzMzE4ZTA2N2MyMWQ3NmUzY2IwZWQ0MDZhYWVmMzAyN2E3YmQ3MWU5YjdlNDBhM2QifQ.niAibSrU5ESYum4yepKYQKrCKGw2yLBAyH-i1mWsvXrDrattVuWFMGoIAMxwyGeLxUdtO70o5Z4yaMWHVsR6Nw"}}}'
 
  const credential = JSON.parse(jsonString);

  const verification = await agent.verifyCredential(credential)
  
  console.log(verification)
}

main().catch(console.log)