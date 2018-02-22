import {loopOverParameters} from './screengrab.js';
import  config from './config.js'
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

console.log(argv);

if (settings.dimensions) {
  if (settings.dimensions.width) {
    windowWidths = settings.dimensions.width
  }

  if (settings.dimensions.height) {
    windowHeights = settings.dimensions.height
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

 
