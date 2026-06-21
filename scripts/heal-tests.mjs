#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const logPath = resolve(root, 'test-failures.log')
const promptPath = resolve(__dirname, 'heal-prompt.md')

const model = process.env.HEAL_MODEL ?? 'opencode-go/deepseek-v4-flash'
const maxAttempts = Number(process.env.HEAL_MAX_ATTEMPTS ?? 1)

function sh(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { cwd: root, encoding: 'utf8', shell: false, ...opts })
}

function runTests() {
  const r = sh('pnpm', ['test', '--reporter=default'], { stdio: ['ignore', 'pipe', 'pipe'] })
  return { code: r.status ?? 1, out: (r.stdout ?? '') + (r.stderr ?? '') }
}

const probe = sh('opencode', ['--version'])
if (probe.error) {
  console.error(
    'opencode not found on PATH. install: curl -fsSL https://opencode.ai/install | bash',
  )
  process.exit(2)
}

const first = runTests()
if (first.code === 0) {
  console.log('tests green — nothing to heal')
  process.exit(0)
}
writeFileSync(logPath, first.out)
console.log(`tests failing — log: ${logPath}`)

if (!existsSync(promptPath)) {
  console.error(`missing prompt file: ${promptPath}`)
  process.exit(2)
}
const basePrompt = readFileSync(promptPath, 'utf8')
const prompt =
  `${basePrompt}\n\n` +
  `Full failure log: ./test-failures.log — read it first.\n\n` +
  `Mode: local. Leave changes in the working tree. Do not commit or push. ` +
  `Print a summary of files changed and why.\n` +
  `Hard cap: ${maxAttempts} iteration(s).`

for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  console.log(`\n--- heal attempt ${attempt}/${maxAttempts} ---`)
  const oc = sh('opencode', ['run', '--dangerously-skip-permissions', '--model', model, prompt], {
    stdio: 'inherit',
  })
  if (oc.status !== 0) console.warn(`opencode exited ${oc.status}`)

  const rerun = runTests()
  if (rerun.code === 0) {
    console.log('tests green after heal')
    rmSync(logPath, { force: true })
    process.exit(0)
  }
  writeFileSync(logPath, rerun.out)
}

console.error('tests still failing after heal — review test-failures.log')
process.exit(1)
