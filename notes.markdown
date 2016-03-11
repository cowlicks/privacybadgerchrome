A plan for single codebase chrome and firefox privacy badger

If this has been discussed before feel free to close this.

Mozilla is planning on providing an extension API that will be compatible with chrome and opera called  [WebExtension](https://developer.mozilla.org/en-US/Add-ons/WebExtensions).
It will be stable [later this year](https://wiki.mozilla.org/RapidRelease/Calendar).

Having two PB codebases seems to be a big violation of DRY. And adds work for developers.

Would

# notes 

chrome is using the "unlimitedstorage" permission.
FF does not support this.
Without it we are limited to less that 5mb of data, but maybe we don't need more than this.
