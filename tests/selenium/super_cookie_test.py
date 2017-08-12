#!/usr/bin/env python
# -*- coding: UTF-8 -*-

import time
import os
import unittest
import json

import pbtest

from selenium.webdriver.common.keys import Keys


def func_maker(n):
    def func(self):
        self.runme()
    func.__name__ = 'test' + str(n)
    return func

class SuperCookieTest(pbtest.PBSeleniumTest):
    """Make sure we detect potential supercookies. """

    def detected_tracking_by(self, origin):
        self.load_url(self.bg_url, wait_on_site=1)

        CHECK_SNITCH_MAP_JS = """return (
  badger.storage.getBadgerStorageObject('snitch_map')
    .getItemClones().hasOwnProperty('{}')
);""".format(origin)

        return self.js(CHECK_SNITCH_MAP_JS)

    def runme(self):
        self.load_url("https://cdn.rawgit.com/ghostwords/d3685dc39f7e67dddf1edf2614beb6fc/raw/a78cfd6c86d51a8d8ab1e214e4e49e2c025d4715/privacy_badger_async_bug_test_fixture.html")

        # the above HTML page reloads itself furiously to trigger our bug
        # we need to wait for it to finish reloading
        self.wait_for_script("return window.DONE_RELOADING === true")

        # the HTML page contains:

        # an iframe from gistcdn.githack.com that writes to localStorage
        self.assertTrue(self.detected_tracking_by("githack.com"),
            msg="IFrame sets localStorage but was not flagged as a tracker.")

        # and an image from raw.githubusercontent.com that doesn't do any tracking
        self.assertFalse(self.detected_tracking_by("raw.githubusercontent.com"),
            msg="Image is not a tracker but was flagged as one.")

for n in range(50):
    setattr(SuperCookieTest, 'test' + str(n), func_maker(n))


if __name__ == "__main__":
    unittest.main()
