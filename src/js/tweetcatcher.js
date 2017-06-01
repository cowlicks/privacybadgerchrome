/*
// a standard embedded tweet is like
<blockquote class="twitter-tweet" data-lang="en">... tweet info ...</blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

// this one has the "no media" box checked. It addes the data-cards="hidden" attribute.
<blockquote class="twitter-tweet" data-cards="hidden" data-lang="en"><p lang="und" dir="ltr">... tweet info ...</blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

// the tweet info is like:
<p lang="und" dir="ltr">
  <a href="https://t.co/BCLUDaCOhI">
    pic.twitter.com/BCLUDaCOhI
  </a>
</p>
  &mdash; Ayşe Deniz Karacagil (@osopartisano)
<a href="https://twitter.com/osopartisano/status/869586179309658113">May 30, 2017</a>

 */

function makeIframeSrcdoc() {
  /* <head></head>
   * <body>
   *   <script src="js/teetjail.js"></script>
   * </body>
   */
  let dom = document.createElement('div');
  dom.appendChild(document.createElement('head'));

  let body = document.createElement('body');
  let script = document.createElement('script');
  script.src = chrome.extension.getURL('js/tweetjail.js');

  body.appendChild(script);
  dom.appendChild(body);
  return dom.innerHTML;
}

function listener(event, iframe, tweet) {
  if (event.data === 'ready') {
    window.addEventListener('message', function resizer(event2) {
      if (event2.data.width) {
        console.log(event2.data);
        iframe.width = event2.data.width;
        iframe.height = event2.data.height;
      }
    });
    iframe.contentWindow.postMessage(tweet.outerHTML, '*');
  }
}

function replacer(tweet) {
  let iframe = document.createElement('iframe');
  iframe.id = 'tweet-jail';
  iframe.sandbox = 'allow-scripts allow-popups allow-popups-to-escape-sandbox';
  iframe.srcdoc = makeIframeSrcdoc();
  iframe.frameBorder = '0';
  iframe.width = '500px';
  iframe.scrolling = 'no';
  iframe.marginWidth = '0';
  iframe.marginHeight = '0';


  window.addEventListener('message', (event) => {
    listener(event, iframe, tweet);
  });
  tweet.parentNode.replaceChild(iframe, tweet);
}

function insertCSS() {
  let link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = chrome.extension.getURL('js/tweet-jail.css');
  document.head.appendChild(link);
}

  
function catchEm() {
  document.querySelectorAll('script[src="//platform.twitter.com/widgets.js"]').forEach((s) => {
    s.remove();
  });

  let tweets = document.querySelectorAll('blockquote[class~=twitter-tweet]');
  for (let tweet of tweets) {
    replacer(tweet);
  }
}

insertCSS();
catchEm();
