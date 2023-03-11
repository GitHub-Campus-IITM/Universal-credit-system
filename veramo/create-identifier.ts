import { agent } from './veramo/setup'

async function main() {
  const identifier = await agent.didManagerCreate({ alias: 'Beta' })
  console.log(`New identifier created`)
  console.log(JSON.stringify(identifier, null, 2))
}

main().catch(console.log)