/* globals badger:false */

(function() {
  function noop () {
    Array.from(arguments).forEach(arg => {
      if (typeof arg == 'function') {
        arg();
      }
    });
  }

  function getter(name) {
    let parts = name.split('.'),
      out = window;
    parts.forEach(part => {
      out = out[part];
    });
    return out;
  }

  function setter(name, value) {
    let parts = name.split('.'),
      last = parts.pop(),
      part = window;
    parts.forEach(partName => {
      part = part[partName];
    });
    part[last] = value;
  }

  function mock(names) {
    let mocked = {};
    names.forEach(name => {
      mocked[name] = getter(name);
      setter(name, noop);
    });
    return mocked;
  }

  function unmock(mocked) {
    Object.keys(mocked).forEach(name => {
      setter(name, mocked[name]);
    });
  }

  let webrequest = require('webrequest');
  QUnit.module('webrequest', {
    beforeEach: function() {
      this.mocked = mock([
        'badger.heuristicBlocking.updateTrackerPrevalence',
      ]);
      this.tabId = -1;
      badger.tabData[this.tabId] = {
        frames: {},
        origins: {},
        blockedCount: 0
      };
    },
    afterEach: function() {
      unmock(this.mocked);
    },
  });
  QUnit.test('recordSuperCookie', function(assert) {
    let done = assert.async(),
      sender = {tab: {url: 'https://sub.tab.org/'}, url: 'https://sub.frame.org/'};

    badger.heuristicBlocking.updateTrackerPrevalence = function(frame, page) {
      assert.equal(frame, 'sub.frame.org');
      assert.equal(page, 'tab.org');
      done();
    };

    webrequest.recordSuperCookie(sender);
  });
})();
