const SitemapGenerator = require('sitemap-generator');

// create generator
const generator = SitemapGenerator('https://cluichi.herokuapp.com', {});

// register event listeners
generator.on('done', () => {
    console.log("Sitemap created");
});

// start the crawler
generator.start();