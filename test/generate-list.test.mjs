import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { XMLParser } from 'fast-xml-parser'

test('index links preserve apostrophes and encode filenames', () => {
  const source = fs.readFileSync(
    new URL('../src/main.ts', import.meta.url),
    'utf8',
  )
  const ast = ts.createSourceFile(
    'main.ts',
    source,
    ts.ScriptTarget.Latest,
    true,
  )
  const names = new Set(['escapeHtml', 'generateList'])
  const functions = ast.statements.filter(
    (statement) =>
      ts.isFunctionDeclaration(statement) && names.has(statement.name?.text),
  )
  assert.equal(functions.length, names.size)
  const code = ts.transpile(
    functions.map((statement) => statement.getText(ast)).join('\n'),
  )
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'twitter-rss-index-'))
  try {
    fs.mkdirSync(path.join(directory, 'output'))
    fs.writeFileSync(path.join(directory, 'template.html'), '{{ RSS-FILES }}')
    for (const file of ["O'Reilly.xml", '日本語.xml']) {
      fs.writeFileSync(
        path.join(directory, 'output', file),
        '<rss><channel><title>Title</title><description>Description</description></channel></rss>',
      )
    }
    const localFs = {
      readdirSync: (file) => fs.readdirSync(path.join(directory, file)),
      readFileSync: (file, encoding) =>
        fs.readFileSync(path.join(directory, file), encoding),
      writeFileSync: (file, content) =>
        fs.writeFileSync(path.join(directory, file), content),
    }
    vm.runInNewContext(`${code}\ngenerateList()`, {
      fs: localFs,
      XMLParser,
      Logger: { configure: () => ({ info: () => {} }) },
    })
    const html = fs.readFileSync(
      path.join(directory, 'output/index.html'),
      'utf8',
    )
    assert.match(html, /<a href='O&#039;Reilly\.xml'>Title<\/a>/)
    assert.match(html, /<a href='%E6%97%A5%E6%9C%AC%E8%AA%9E\.xml'>Title<\/a>/)
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})
