const fs = require('fs');

export function createOutputDirectory(directory) {
  if (!fs.existsSync(`./${directory}`)) {
    fs.mkdirSync(directory);
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
export async function saveScreenshot(settings, imageData, pageURL, windowWidth, windowHeight) {
    const rootFileName = pageURL.replace('http://','').replace('https://','').replace(/\//g,'_');
    const filename = `${rootFileName}.${windowWidth}x${windowHeight}.${settings.fileExt}`;

    createOutputDirectory(settings.imgDirectory);

    fs.writeFile(
        `${settings.imgDirectory}/${filename}`,
        imageData.data, {encoding:'base64'},
        (err)=>{
            if (err) throw err;
        }
    );
}