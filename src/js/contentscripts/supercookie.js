/*
 * This file is part of Privacy Badger <https://www.eff.org/privacybadger>
 * Copyright (C) 2015 Electronic Frontier Foundation
 *
 * Derived from Chameleon <https://github.com/ghostwords/chameleon>
 * Copyright (C) 2015 ghostwords
 *
 * Privacy Badger is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Privacy Badger is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Privacy Badger.  If not, see <http://www.gnu.org/licenses/>.
 */

(function() {

let superCookieFunction = () => {
  // code below is not a content script: no chrome.* APIs /////////////////////
  let event_id = document.currentScript.getAttribute('data-event-id');

  let startHandler = e => {
    if (e.detail.enabledAndThirdParty) {
      // rm this handler
      document.removeEventListener(event_id, startHandler);
      // start checking for supercookies
      let stop_id = start();

      let stopHandler = e2 => {
        if (e2.detail.hasSuperCookie) {
          // stop checking for supercookies
          clearInterval(stop_id);
        }
      };
      document.addEventListener(event_id, stopHandler);
    }
  };

  /**
   * Read the local storage and returns content
   * @returns {{}}
   */
  let getLocalStorageItems = () => {
    let lsItems = {};
    let lsKey = "";
    try{
      for (let i = 0; i < localStorage.length; i++) {
        lsKey = localStorage.key(i);
        lsItems[lsKey] = localStorage.getItem(lsKey);
      }
    } catch(err){
      // We get a SecurityError when our injected script runs in a 3rd party frame and
      // the user has disabled 3rd party cookies and site data. See, http://git.io/vLwff
      return {};
    }
    return lsItems;
  };

  /**
   * send message to the content script
   *
   * @param message
   */
  let send = (message) => {
    document.dispatchEvent(new CustomEvent(event_id, {
      detail: message
    }));
  };

  let start = () => {
    send({localStorageItems: getLocalStorageItems()});
    return setInterval(() => send({localStorageItems: getLocalStorageItems()}), 4000);
  };

  document.addEventListener(event_id, startHandler);
  // code above is not a content script: no chrome.* APIs /////////////////////
};

/**
 * Insert script into page
 *
 * @param {String} text The script to insert into the page
 * @param {Object} data a dictionary containing attribut-value pairs
 */
function insertScScript(text, data) {
  let parent = document.documentElement,
    script = document.createElement('script');

  script.text = text;
  script.async = false;

  for (let key in data) {
    script.setAttribute('data-' + key.replace(/_/g, "-"), data[key]);
  }

  parent.insertBefore(script, parent.firstChild);
  parent.removeChild(script);
}

/**
 * Generate script to inject into the page
 * @param {String} text of a function
 * @returns {String}
 */
function getScPageScript(functionString) {
  return '(' + functionString + ')();';
}

let event_id = Math.random();

document.addEventListener(event_id, function (e) {
  // pass messages from the page to the background page
  if ('localStorageItems' in e.detail) {
    chrome.runtime.sendMessage({
      'superCookieReport': e.detail
    }, hasSuperCookie => {
      if (hasSuperCookie) {
        // super cookie found, message page so it will stop searching
        document.dispatchEvent(new CustomEvent(event_id, {
          detail: {hasSuperCookie}
        }));
      }
    });
  }
});

// insert the script into the page
insertScScript(getScPageScript(superCookieFunction.toString()), {
  event_id: event_id,
});

// check if enabled for this page
chrome.runtime.sendMessage({
  checkEnabledAndThirdParty: true
}, enabledAndThirdParty => {
  document.dispatchEvent(new CustomEvent(event_id, {
    detail: {enabledAndThirdParty}
  }));
});

})();
