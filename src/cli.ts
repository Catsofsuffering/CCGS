#!/usr/bin/env node
import cac from 'cac'
import { setupCommands } from './cli-setup'
import { CANONICAL_BINARY_NAME } from './utils/identity'
import { normalizeLegacyLongOptions } from './utils/argv'

async function main(): Promise<void> {
  const cli = cac(CANONICAL_BINARY_NAME)
  await setupCommands(cli)
  cli.parse(normalizeLegacyLongOptions(process.argv))
}

main().catch(console.error)
