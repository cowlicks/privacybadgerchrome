(function() {
  let messages = require('messages'),
    methods = new Set([
      'base.method',
      'base.another.thing',
      'base.even.longer.stuff',
    ]),
    beforeSendMessage = chrome.runtime.sendMessage;

  QUnit.module("Messages", {
    before: () => {
      // dummy sendMessage func
      chrome.runtime.sendMessage = function (messageObject, responseCallback) {
        responseCallback(messageObject);
      };
    },
    after: () => {
      chrome.runtime.sendMessage = beforeSendMessage;
    },
  });

  QUnit.test('Client test', (assert) => {
    let done = assert.async(3);
    assert.expect(10);

    let client = new messages.Client(methods);

    // assert methods are added to client
    assert.ok('method' in client);
    assert.ok('another' in client);
    assert.ok('stuff' in client.even.longer);

    client.method('foo', 'bar').then(obj => {
      assert.ok(obj.method === 'base.method');
      assert.deepEqual(obj.args, ['foo', 'bar']);

      done();
    });

    client.another.thing(1, 2, 3).then(obj => {
      assert.ok(obj.method === 'base.another.thing');
      assert.deepEqual(obj.args, [1, 2, 3]);

      done();
    });

    // test callback
    client.even.longer.stuff(1, 2, res => {
      res.callbackCalled = true;
      return res;
    }).then(obj => {
      assert.ok(obj.method == 'base.even.longer.stuff');
      assert.deepEqual(obj.args, [1, 2])
      assert.ok(obj.callbackCalled);

      done();
    });
  });
  QUnit.test('Listener test', (assert) => {
    let done = assert.async(3);
    assert.expect(3);
    window.base = {
      method: function() {return 'base.method ' + Array.from(arguments);},
      another: {thing: function() {return 'base.another.thing ' + Array.from(arguments);}},
      even: {longer: {stuff: function() {return 'base.even.longer.stuff ' + Array.from(arguments);}}},
    };
    let onMessage = messages.makeOnMessage(methods);
    onMessage({method: 'base.method', args: [6, 7, 8]}, {}, function(result) {
      assert.ok(result == 'base.method 6,7,8');
      done();
    });
    onMessage({method: 'base.another.thing', args: []}, {}, (result) => {
      assert.ok(result == 'base.another.thing ');
      done();
    });
    onMessage({method: 'base.even.longer.stuff', args: [1]}, {}, (result) => {
      assert.ok(result == 'base.even.longer.stuff 1');
      done();
    });
  });
})();
