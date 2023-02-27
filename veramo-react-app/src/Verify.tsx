import React, { useEffect, useState } from 'react'
import './App.css'

import { agent } from './veramo/setup'

function Verify() {
  const [result, setResult] = useState<any>()
  const [vcString, setVcString] = useState<string>('')
  const [credentialSubject, setCredentialSubject] = useState<any>()
  let verifiableCredential;

  const verify = async (vcJson: string) => {
// {"credential":{"credentialSubject":{"RollNo":"A00A0000","id":"did:ethr:goerli:0x03bbe111dc9d0cb60ad85bad8ab1d461c727f7aae11a8dff370e40682868af230d"},"issuer":{"id":"did:ethr:goerli:0x03ba0a0eeb5f854f9a3318e067c21d76e3cb0ed406aaef3027a7bd71e9b7e40a3d"},"type":["VerifiableCredential"],"@context":["https://www.w3.org/2018/credentials/v1"],"issuanceDate":"2023-02-23T11:39:11.000Z","proof":{"type":"JwtProof2020","jwt":"eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7IlJvbGxObyI6IkEwMEEwMDAwIn19LCJzdWIiOiJkaWQ6ZXRocjpnb2VybGk6MHgwM2JiZTExMWRjOWQwY2I2MGFkODViYWQ4YWIxZDQ2MWM3MjdmN2FhZTExYThkZmYzNzBlNDA2ODI4NjhhZjIzMGQiLCJuYmYiOjE2NzcxNTIzNTEsImlzcyI6ImRpZDpldGhyOmdvZXJsaToweDAzYmEwYTBlZWI1Zjg1NGY5YTMzMThlMDY3YzIxZDc2ZTNjYjBlZDQwNmFhZWYzMDI3YTdiZDcxZTliN2U0MGEzZCJ9.rqE7Mco80FJ4PVt9aHNsG8fnpHucUdo8Eu7LOptgXOU1grnxLfv1FHxb42m5g-py_7k9e77OUMIJBXP-QnpLCQ"}}}'
    const vc = JSON.parse(vcJson);
    const doc = await agent.verifyCredential(vc)
    setResult(doc)
    verifiableCredential = doc.payload.vc.credentialSubject
    setCredentialSubject(verifiableCredential)
  }

  // useEffect(() => {
  //   verify()
  // }, [])

  const handleChange = (event : React.ChangeEvent<HTMLInputElement>) => {
    setVcString(event.target.value)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    verify(vcString);  }

  

  return (
    <div className="page">
      <header className="App-header">
        

      </header>
<div className="form-box">
      <form onSubmit={(event) => handleSubmit(event)}>
        <h1 className='text'>VC Verifier</h1>
        <label className='text'>
            <input className='input' type="string" name='VC' onChange={(event)=> handleChange(event)}/>


        </label>
        <button type="submit" value="submit" > Verify</button>
      </form>
      </div>
      <div id='result'>
        <pre>{result && JSON.stringify(result.verified, null, 2) }</pre>
        <pre>{result && JSON.stringify(credentialSubject, null, 2) }</pre>
      </div>
      
    </div>
  )
}

export default Verify