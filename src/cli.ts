#!/usr/bin/env node
import cac from 'cac'
import { setupCommands } from './cli-setup'
import { CANONICAL_BINARY_NAME } from './utils/identity'

async function main(): Promise<void> {
  const cli = cac(CANONICAL_BINARY_NAME)
  await setupCommands(cli)
  cli.parse()
}

main().catch(console.error)
