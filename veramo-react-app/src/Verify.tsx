import React, { InputHTMLAttributes, useEffect, useState } from 'react'
import './App.css'

import { agent } from './veramo/setup'

function Verify() {
  const [result, setResult] = useState<any>()
  const [vcString, setVcString] = useState<string>('')
  const [credentialSubject, setCredentialSubject] = useState<any>()
  const [file, setFile] = useState<any>()
  let verifiableCredential;

  const verify = async (vcJson: string) => {
    setResult(null)
    const vc = JSON.parse(vcJson);
    const doc = await agent.verifyCredential(vc)
    setResult(doc)
    verifiableCredential = doc.payload.vc.credentialSubject
    setCredentialSubject(verifiableCredential)
  }




  const handleChange = (event : React.ChangeEvent<HTMLInputElement>) => {
    setVcString(event.target.value)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    verify(vcString); 
   }


  return (
    <div className="page">
      <header className="App-header">
        

      </header>
<div className="form-box">
      <form onSubmit={(event) => handleSubmit(event)}>
        <h1 className='text'>VC Verifier</h1>
        
            <input className='input' type="string" name='VC' onChange={(event)=> handleChange(event)}/>

        
        <button type="submit" value="submit" > Verify</button>
      </form>
      </div>
      <div id='result'>
        {result ? (<pre>{result && JSON.stringify(result.verified, null, 2) }</pre>):(
          <pre>Loading..</pre>
        )}
        {/* <pre>{result && JSON.stringify(result.verified, null, 2) }</pre> */}
      </div>
      
    </div>
  )
}

export default Verify