import { agent } from "./veramo/setup";

async function main() {
    const raw = 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImh0dHBzOi8vdmVyYW1vLmlvL2NvbnRleHRzL3Byb2ZpbGUvdjEiXSwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJ5b3UiOiJSb2NrIn19LCJzdWIiOiJkaWQ6d2ViOmV4YW1wbGUuY29tIiwibmJmIjoxNjY1NDQ2NTgxLCJpc3MiOiJkaWQ6ZXRocjpnb2VybGk6MHgwMmExNDYzZDIyMDVjN2NkN2ZiMjkzY2RlNGQ5ZTM2YWRjYTk5MGY3ZWZhOTBiOTVlNTRmNTBkZjBhMTZjMTc0MjIifQ.cOUOSic-8YGQfUGPmHjj5HDS09LXGj9nEe6UOsbYRbl-VZMoLBNHcFgp2B-ZWNhe202B-pbCK51xM3viO3OfZA'

    let parsedMessage = await agent.handleMessage({raw, save: false})

   console.log(parsedMessage)
}

main().catch(console.log)