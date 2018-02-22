# ScreenGrabr
 an NPM module (eventually) that can grab screenshots using headless chrome. Runs either via config or command line. Great for smoke testing and regression. 

 It doesn't do automation. It just goes to web pages faster than you can. 

## Basic CLI usage:

  * `node index.js -w 1024 -h 768 --url=http://google.com`
  * `node index.js --widths=1024,768 -h 768 --url=http://google.com`
  * `node index.js --widths=1024,768 --heights=1024,768 --url=http://google.com`
  * `node index.js --widths=1024,768 --heights=1024,768 --urls=http://google.com, http://amazon.com`
  * `node index.js --widths=1024,768 --urlFile=myurls.json` 
  myurls.json should be an array of urls

## Advanced CLI Usage:
`node index.js --grabConfig=myconfig.js`

eventually should be a proper npm command: `npm run grab BLAHCONFIG.js`

Structure the config file like so:

	module.exports = {
		imgDirectory: 'my-screengrabs',
		dimensions: {
			width: [1024],
			height: [768]
		},
		urls: [
			'https://mysite.com',
			'https://mysite.com/about,
		]
	}
