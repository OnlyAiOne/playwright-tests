"""Finds the browser driver with Selenium Manager, ignoring any driver already on PATH.

Without this, an old chromedriver on PATH (e.g. from a `chromedriver-binary` install) is used
and fails with "This version of ChromeDriver only supports Chrome version ...".
"""
from robot.api.deco import keyword, library
from selenium.webdriver.common.selenium_manager import SeleniumManager


@library(scope="GLOBAL")
class Drivers:

    @keyword
    def driver_path_for(self, browser):
        paths = SeleniumManager().binary_paths(["--browser", browser, "--skip-driver-in-path"])
        return paths["driver_path"]
