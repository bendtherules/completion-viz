'use strict';

try {
  require('@snek/source-map-support/register');
} catch {}

const path = require('path');
const fs = require('fs');
const util = require('util');
const glob = require('glob');

const readList = (name) => {
  const source = fs.readFileSync(path.resolve(__dirname, name), 'utf8');
  return source.split('\n').filter((l) => l && !l.startsWith('#'));
};
const readListPaths = (name) => readList(name)
  .flatMap((t) => glob.sync(path.resolve(__dirname, 'test262', 'test', t)))
  .map((f) => path.relative(path.resolve(__dirname, 'test262'), f));

const disabledFeatures = [];
const featureMap = {};
readList('features')
  .forEach((f) => {
    if (f.startsWith('-')) {
      disabledFeatures.push(f.slice(1));
    }
    if (f.includes('=')) {
      const [k, v] = f.split('=');
      featureMap[k.trim()] = v.trim();
    }
  });

if (!process.send) {
  // supervisor

  const childProcess = require('child_process');
  const TestStream = require('test262-stream');

  const {
    pass,
    fail,
    skip,
    total,
    CPU_COUNT,
  } = require('../base');

  const override = process.argv.find((e, i) => i > 1 && !e.startsWith('-'));
  const NUM_WORKERS = process.env.NUM_WORKERS
    ? Number.parseInt(process.env.NUM_WORKERS, 10)
    : Math.round(CPU_COUNT * 0.75);
  const RUN_SLOW_TESTS = process.argv.includes('--run-slow-tests');

  const createWorker = () => {
    const c = childProcess.fork(__filename);
    c.on('message', (message) => {
      const { description, status, error } = message;
      switch (status) {
        case 'PASS':
          pass();
          break;
        case 'FAIL':
          fail(description, error);
          break;
        case 'SKIP':
          skip();
          break;
        default:
          throw new RangeError(JSON.stringify(message));
      }
    });
    c.on('exit', (code) => {
      if (code !== 0) {
        process.exit(1);
      }
    });
    return c;
  };

  const workers = Array.from({ length: NUM_WORKERS }, () => createWorker());
  let longRunningWorker;
  if (RUN_SLOW_TESTS) {
    longRunningWorker = createWorker();
  }

  const slowlist = readListPaths('slowlist');
  const skiplist = readListPaths('skiplist');

  const stream = new TestStream(path.resolve(__dirname, 'test262'), {
    paths: [override || 'test'],
    omitRuntime: true,
  });

  let workerIndex = 0;
  stream.on('data', (test) => {
    if (test.attrs.flags.module && test.scenario !== 'default') {
      // test262-stream duplicates module tests, deduplicate here
      return;
    }

    if (/annexB|intl402/.test(test.file)) {
      return;
    }

    total();

    if ((test.attrs.features && test.attrs.features.some((feature) => disabledFeatures.includes(feature)))
        || skiplist.includes(test.file)) {
      skip();
      return;
    }

    if (slowlist.includes(test.file)) {
      if (RUN_SLOW_TESTS) {
        longRunningWorker.send(test);
      } else {
        skip();
      }
    } else {
      workers[workerIndex].send(test);
      workerIndex += 1;
      if (workerIndex >= workers.length) {
        workerIndex = 0;
      }
    }
  });

  stream.on('end', () => {
    workers.forEach((w) => {
      w.send('DONE');
    });
    if (RUN_SLOW_TESTS) {
      longRunningWorker.send('DONE');
    }
  });
} else {
  // worker

  const {
    Agent,
    setSurroundingAgent,
    inspect,

    Value,

    IsCallable,
    IsDataDescriptor,
    Type,

    AbruptCompletion,
    Throw,
  } = require('../..');
  const { createRealm } = require('../../bin/test262_realm');

  const isError = (type, value) => {
    if (Type(value) !== 'Object') {
      return false;
    }
    const proto = value.Prototype;
    if (!proto || Type(proto) !== 'Object') {
      return false;
    }
    const ctorDesc = proto.properties.get(new Value('constructor'));
    if (!ctorDesc || !IsDataDescriptor(ctorDesc)) {
      return false;
    }
    const ctor = ctorDesc.Value;
    if (Type(ctor) !== 'Object' || IsCallable(ctor) !== Value.true) {
      return false;
    }
    const namePropDesc = ctor.properties.get(new Value('name'));
    if (!namePropDesc || !IsDataDescriptor(namePropDesc)) {
      return false;
    }
    const nameProp = namePropDesc.Value;
    return Type(nameProp) === 'String' && nameProp.stringValue() === type;
  };

  const includeCache = {};

  const run = (test) => {
    const features = [];
    if (test.attrs.features) {
      test.attrs.features.forEach((f) => {
        if (featureMap[f]) {
          features.push(featureMap[f]);
        }
      });
    }
    const agent = new Agent({
      features,
    });
    setSurroundingAgent(agent);

    const {
      realm, trackedPromises,
      resolverCache, setPrintHandle,
    } = createRealm({ file: test.file });
    const r = realm.scope(() => {
      test.attrs.includes.unshift('assert.js', 'sta.js');
      if (test.attrs.flags.async) {
        test.attrs.includes.unshift('doneprintHandle.js');
      }

      for (const include of test.attrs.includes) {
        if (includeCache[include] === undefined) {
          const p = path.resolve(__dirname, `./test262/harness/${include}`);
          includeCache[include] = {
            source: fs.readFileSync(p, 'utf8'),
            specifier: p,
          };
        }
        const entry = includeCache[include];
        const completion = realm.evaluateScript(entry.source, { specifier: entry.specifier });
        if (completion instanceof AbruptCompletion) {
          return { status: 'FAIL', error: inspect(completion) };
        }
      }

      {
        const completion = realm.evaluateScript(`\
var Test262Error = class Test262Error extends Error {};

function $DONE(error) {
  if (error) {
    if (typeof error === 'object' && error !== null && 'stack' in error) {
      __consolePrintHandle__('Test262:AsyncTestFailure:' + error.stack);
    } else {
      __consolePrintHandle__('Test262:AsyncTestFailure:Test262Error: ' + error);
    }
  } else {
    __consolePrintHandle__('Test262:AsyncTestComplete');
  }
}`);
        if (completion instanceof AbruptCompletion) {
          return { status: 'FAIL', error: inspect(completion) };
        }
      }

      let asyncResult;
      if (test.attrs.flags.async) {
        setPrintHandle((m) => {
          if (m.stringValue && m.stringValue() === 'Test262:AsyncTestComplete') {
            asyncResult = { status: 'PASS' };
          } else {
            asyncResult = { status: 'FAIL', error: m.stringValue ? m.stringValue() : inspect(m) };
          }
          setPrintHandle(undefined);
        });
      }

      const specifier = path.resolve(__dirname, 'test262', test.file);

      let completion;
      if (test.attrs.flags.module) {
        completion = realm.createSourceTextModule(specifier, test.contents);
        if (!(completion instanceof AbruptCompletion)) {
          const module = completion;
          resolverCache.set(specifier, module);
          completion = module.Link();
          if (!(completion instanceof AbruptCompletion)) {
            completion = module.Evaluate();
          }
          if (!(completion instanceof AbruptCompletion)) {
            if (completion.PromiseState === 'rejected') {
              completion = Throw(completion.PromiseResult);
            }
          }
        }
      } else {
        completion = realm.evaluateScript(test.contents, { specifier });
      }

      if (completion instanceof AbruptCompletion) {
        if (test.attrs.negative && isError(test.attrs.negative.type, completion.Value)) {
          return { status: 'PASS' };
        } else {
          return { status: 'FAIL', error: inspect(completion) };
        }
      }

      if (test.attrs.flags.async) {
        if (!asyncResult) {
          throw new Error('missing async result');
        }
        return asyncResult;
      }

      if (trackedPromises.length > 0) {
        return { status: 'FAIL', error: inspect(trackedPromises[0]) };
      }

      if (test.attrs.negative) {
        return { status: 'FAIL', error: `Expected ${test.attrs.negative.type} during ${test.attrs.negative.phase}` };
      } else {
        return { status: 'PASS' };
      }
    });

    return r;
  };

  let p = Promise.resolve();
  const handleSendError = (e) => {
    if (e) {
      process.exit(1);
    }
  };
  process.on('message', (test) => {
    if (test === 'DONE') {
      p.then(() => process.exit(0));
      p = undefined;
    } else {
      const description = `${test.file}\n${test.attrs.description}`;
      p = p
        .then(() => run(test))
        .then((r) => {
          process.send({ description, ...r }, handleSendError);
        })
        .catch((e) => {
          process.send({ description, status: 'FAIL', error: util.inspect(e) }, handleSendError);
        });
    }
  });
}
