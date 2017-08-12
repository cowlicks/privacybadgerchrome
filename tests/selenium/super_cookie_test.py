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
        self.load_url("https://rawgit.com/gunesacar/24d81a5c964cb563614162c264be32f0/raw/8fa10f97b87343dfb62ae9b98b753c73a995157e/frame_ls.html",  # noqa
                      wait_on_site=1)
        self.driver.refresh()
        time.sleep(1)
        self.assertTrue(self.detected_tracking_by("githack.com"))

for n in range(50):
    setattr(SuperCookieTest, 'test' + str(n), func_maker(n))


if __name__ == "__main__":
    unittest.main()
