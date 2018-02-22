(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

const fs$1 = require('fs');

function createOutputDirectory(directory) {
  if (!fs$1.existsSync(`./${directory}`)) {
    fs$1.mkdirSync(directory);
  }
}

/**
 *  Saves a screenshot to the file system, in the folder where this file is being run
 *  @param {Object} settings string of folder where images go
 * @param {String} imageData base64 string of image data
 * @param {String} pageURL url of the page (used for generating file name)
 * @param {String} windowWidth width of page (used in filename)
 * @param {String} windowHeight height of page (used in filename)
 */
async function saveScreenshot(settings, imageData, pageURL, windowWidth, windowHeight) {
    const rootFileName = pageURL.replace('http://','').replace('https://','').replace(/\//g,'_');
    const filename = `${rootFileName}.${windowWidth}x${windowHeight}.${settings.fileExt}`;

    createOutputDirectory(settings.imgDirectory);

    fs$1.writeFile(
        `${settings.imgDirectory}/${filename}`,
        imageData.data, {encoding:'base64'},
        (err)=>{
            if (err) throw err;
        }
    );
}

const chromeLauncher = require('lighthouse/chrome-launcher/chrome-launcher');
const CDP = require('chrome-remote-interface');
/**
 * Launches a debugging instance of Chrome.
 *     False launches a full version of Chrome.
 * @return {Promise<ChromeLauncher>}
 */


/** 
 * Generates instance of chrome, based on dimensions, saves a screenshot of it
 * @param {Ojbect} settings Directory where screenshot goes
 * @param {string} pageURL : url of page
 * @param {string} windowWidth: width of window as an int
 * @param {string} windowHeight: height of window as an int
*/
async function saveScreenShotFromURL(settings, pageURL, windowWidth, windowHeight) {
    const launchConfig = {
        chromeFlags: [
            `--window-size=${windowWidth},${windowHeight}`,
            '--disable-gpu',
            '--headless'
        ]
    };
     const chrome = await chromeLauncher.launch(launchConfig);
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
async function loopOverParameters(settings, urls, widths, heights) {
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

var config = {
	imgDirectory: 'screengrabs',
	dimensions: {
		width: [1024],
		height: [1024]
	},
	fileExt: 'png'
};

/** Pre requisites 
 * MAC ONLY FOR RIGHT NOW! Not my fault. We have to wait for Headless Chrome to hit Windows users
1) Make an Alias to Chrome
  alias chrome="/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"
  alias chrome-canary="/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary"
  
2) Make Sure yarn is installed (it caches packages so you don't have to download them again)
    `npm i yarn`

3) Use yarn to install dependencies:
  `yarn add lighthouse`
  `yarn add chrome-remote-interface`

 * USAGE:
 * `node headless-screenshot.js -w 1024 -h 768 --url=http://google.com`
 * `node headless-screenshot.js --widths=1024,768 -h 768 --url=http://google.com`
 * `node headless-screenshot.js --widths=1024,768 --heights=1024,768 --url=http://google.com`
 * `node headless-screenshot.js --widths=1024,768 --heights=1024,768 --urls=http://google.com, http://amazon.com`
 * `node headless-screenshot.js --widths=1024,768 --urlFile=myurls.json
 *  myurls.json should be an array of urls
 */

/* Dependencies */

const fs = require('fs');
const settings = config;
const argv = require('minimist')(process.argv.slice(2));
let grabConfig;

if (argv.grabConfig && argv.grabConfig.indexOf('.js') != -1) {
  grabConfig = require(`./${argv.grabConfig}`);
  Object.assign(settings,grabConfig);
}

const windowWidth = argv.w ? [argv.w] : settings.dimensions.width;
const windowHeight = argv.h ? [argv.h] : settings.dimensions.height;
let windowWidths = argv.widths ? argv.widths.split(',') : windowWidth;
let windowHeights = argv.heights ? argv.heights.split(',') : windowHeight;

if (settings.dimensions) {
  if (settings.dimensions.width) {
    windowWidths = settings.dimensions.width;
  }

  if (settings.dimensions.height) {
    windowHeights = settings.dimensions.height;
  }

}


let urls = argv.urls ? argv.urls.split(',') : [argv.url];
if (!argv.url && settings.urls) {
  urls = settings.urls;
}

if (argv.urlFile && argv.urlFile.indexOf('.json') != -1) {
    urls = require(`./${argv.urlFile}`);
}




console.time('grabbing');
 loopOverParameters(settings, urls, windowWidths, windowHeights)
  .then(() => {
    console.timeEnd('grabbing');
    console.log('Resolved!');
  })
  .catch((err)=> {
    console.warn(err);
    console.timeEnd('grabbing');
  });

})));
