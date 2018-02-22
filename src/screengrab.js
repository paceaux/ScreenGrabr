const chromeLauncher = require('lighthouse/chrome-launcher/chrome-launcher');
const CDP = require('chrome-remote-interface');
import {saveScreenshot} from './savefile.js';
/**
 * Launches a debugging instance of Chrome.
 *     False launches a full version of Chrome.
 * @return {Promise<ChromeLauncher>}
 */
export async function launchChrome(launchConfig) {
  return await chromeLauncher.launch(launchConfig);
}

/** 
 * Generates instance of chrome, based on dimensions, saves a screenshot of it
 * @param {Ojbect} settings Directory where screenshot goes
 * @param {string} pageURL : url of page
 * @param {string} windowWidth: width of window as an int
 * @param {string} windowHeight: height of window as an int
*/
export async function saveScreenShotFromURL(settings, pageURL, windowWidth, windowHeight) {
    const launchConfig = {
        chromeFlags: [
            `--window-size=${windowWidth},${windowHeight}`,
            '--disable-gpu',
            '--headless'
        ]
    };
     const chrome = await chromeLauncher.launch(launchConfig);;
     const protocol = await CDP({port: chrome.port});
     const {Page, Runtime} = protocol;

     await Promise.all([Page.enable(), Runtime.enable()]);

     Page.navigate({url: pageURL});

     Page.loadEventFired(async () => {
        const screenshot = await Page.captureScreenshot();

        await saveScreenshot(settings, screenshot, pageURL, windowWidth, windowHeight);
        

        protocol.close();
        chrome.kill();
     });
 }

/**
 * @param {Object} settings [description]
 * @param {Array} urls 
 * @param {Array} widths 
 * @param {Array} heights 
 */
export async function loopOverParameters(settings, urls, widths, heights) {
    const screenshots = [];

    urls.forEach((url) => {
        widths.forEach((width) => {
            heights.forEach((height) => {
                screenshots.push( saveScreenShotFromURL(settings, url, width,height));
            });
        });
    });
    return await Promise.all(screenshots);
 }