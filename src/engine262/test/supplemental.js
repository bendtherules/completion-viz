'use strict';

const assert = require('assert');
const {
  Abstract,
  Agent,
  Realm,
  Value,
} = require('..');
const { total, pass, fail } = require('./base');

// Features that cannot be tested by test262 should go here.

[
  () => {
    const agent = new Agent();
    agent.enter();
    const realm = new Realm();
    const result = realm.evaluateScript('debugger;');
    assert.strictEqual(result.Value, Value.undefined);
  },
  () => {
    const agent = new Agent({
      onDebugger() {
        return new Value(realm, 42);
      },
    });
    agent.enter();
    const realm = new Realm();
    const result = realm.evaluateScript('debugger;');
    assert.strictEqual(result.Value.numberValue(), 42);
  },
  () => {
    const agent = new Agent();
    agent.enter();
    const realm = new Realm();
    const result = realm.evaluateScript(`
      function x() { throw new Error('owo'); }
      function y() { x(); }
      try {
        y();
      } catch (e) {
        e.stack;
      }
    `);
    assert.strictEqual(result.Value.stringValue(), `
Error: owo
    at x (<anonymous>:2:37)
    at y (<anonymous>:3:21)
    at <anonymous>:5:8`.trim());
  },
  () => {
    const agent = new Agent();
    agent.enter();
    const realm = new Realm();
    const result = realm.evaluateScript(`
      async function x() { await 1; throw new Error('owo'); }
      async function y() { await x(); }
      y().catch((e) => e.stack);
    `);
    assert.strictEqual(result.Value.PromiseResult.stringValue(), `
Error: owo
    at async x (<anonymous>:2:52)
    at async y (<anonymous>:3:33)`.trim());
  },
  () => {
    const agent = new Agent();
    agent.enter();
    const realm = new Realm();
    const result = realm.evaluateScript(`
      function x() { Reflect.get(); }
      try {
        x();
      } catch (e) {
        e.stack;
      }
    `);
    assert.strictEqual(result.Value.stringValue(), `
TypeError: undefined is not an object
    at get (native)
    at x (<anonymous>:2:21)
    at <anonymous>:4:8`.trim());
  },
  () => {
    const agent = new Agent();
    agent.enter();
    const realm = new Realm();
    const result = realm.evaluateScript(`
      function Y() { throw new Error('owo'); }
      function x() { new Y(); }
      try {
        x();
      } catch (e) {
        e.stack;
      }
    `);
    assert.strictEqual(result.Value.stringValue(), `
Error: owo
    at new Y (<anonymous>:2:37)
    at x (<anonymous>:3:25)
    at <anonymous>:5:8`.trim());
  },
  () => {
    const agent = new Agent();
    agent.enter();
    const realm = new Realm();
    const result = realm.evaluateScript(`
      let e;
      new Promise(() => {
        e = new Error('owo');
      });
      e.stack;
    `);
    assert.strictEqual(result.Value.stringValue(), `
Error: owo
    at <anonymous> (<anonymous>:4:22)
    at new Promise (native)
    at <anonymous>:3:18`.trim());
  },
  () => {
    const agent = new Agent({
      features: ['WeakRefs'],
    });
    agent.enter();
    const realm = new Realm();
    const result = realm.evaluateScript(`
      const w = new WeakRef({});
      Promise.resolve()
        .then(() => {
          if (typeof w.deref() !== 'object') {
            throw new Error();
          }
        })
        .then(() => {
          if (typeof w.deref() !== 'undefined') {
            throw new Error();
          }
        })
        .then(() => 'pass');
    `);
    assert.strictEqual(result.Value.PromiseResult.stringValue(), 'pass');
  },
  () => {
    const agent = new Agent({
      features: ['WeakRefs'],
    });
    agent.enter();
    const realm = new Realm();
    const module = realm.createSourceTextModule('test.js', `
      const w = new WeakRef({});
      globalThis.result = Promise.resolve()
        .then(() => {
          if (typeof w.deref() !== 'object') {
            throw new Error();
          }
        })
        .then(() => {
          if (typeof w.deref() !== 'undefined') {
            throw new Error();
          }
        })
        .then(() => 'pass');
    `);
    module.Link();
    module.Evaluate();
    const result = Abstract.Get(realm.global, new Value(realm, 'result'));
    assert.strictEqual(result.Value.PromiseResult.stringValue(), 'pass');
  },
].forEach((test) => {
  total();
  try {
    test();
    pass();
  } catch (e) {
    fail('', e.stack || e);
  }
});
