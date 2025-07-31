const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();
const querystring = require('querystring');

puppeteer.use(StealthPlugin());


// Proxy helper
function getScrapeOpsUrl(url, location = "us") {
    const payload = {
        api_key: process.env.SCRAPEOPS_API_KEY,
        url: url,
        country: location,
        residential: true
    };
    return "https://proxy.scrapeops.io/v1/?" + querystring.stringify(payload);
}

const router = express.Router();

// Not Working BOT Protection -- Pupeeteer is blocked cloudflare anti bot protection !!
router.post('/scrape-from-url', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: false
    });
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    await page.setViewport({
      width: Math.floor(1024 + Math.random() * 100),
      height: Math.floor(768 + Math.random() * 100),
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait a bit manually just in case
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Dump page content to console
    const html = await page.content();
    console.log('🔍 Scraped page content:\n', html); // Just print the first 1000 chars

    const jobs = await page.evaluate(() => {
      const jobNodes = document.querySelectorAll('[data-jk]');
      const results = [];

      jobNodes.forEach((el) => {
        const title = el.querySelector('h2 span')?.innerText || '';
        const company = el.querySelector('.companyName')?.innerText || '';
        const location = el.querySelector('.companyLocation')?.innerText || '';
        const summary = el.querySelector('.job-snippet')?.innerText?.trim() || '';

        if (title && company) {
          results.push({ title, company, location, summary });
        }
      });

      return results;
    });


    await browser.close();

    res.json(jobs);
  } catch (err) {
    console.error('Scraping error:', err.message);
    res.status(500).json({ error: 'Failed to scrape the URL' });
  }
});




// Working -- open source scraping 
const stacks = ['angularjs', 'kubernetes', 'javascript', 'jenkins', 'html']; // Add more as needed
router.post('/scrape-linkedin', async (req, res) => {
  const { searchText, locationText = '', pageNumber = 0 } = req.body;

  const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(searchText)}&start=${pageNumber * 25}${locationText ? '&location=' + encodeURIComponent(locationText) : ''}`;

  try {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    const stacks = ['react', 'angular', 'vue', 'node', 'python', 'typescript', 'java', 'c#']; 
    const jobs = await page.evaluate((stacks) => {
      const cards = document.querySelectorAll('.base-card');
      const results = [];

      for (const item of cards) {
        try {
          const title = item.querySelector('.base-search-card__title')?.textContent?.trim() || '';
          const imgSrc = item.querySelector('img')?.getAttribute('data-delayed-url') || '';
          const remoteOk = /remote|work from home/i.test(title);

          const fullLink = item.querySelector('.base-card__full-link')?.getAttribute('href') || '';
          const jobUrl = fullLink.startsWith('http') ? fullLink : `https://www.linkedin.com${fullLink}`;

          const companyLinkEl = item.querySelector('.base-search-card__subtitle a');
          const companyName = companyLinkEl?.textContent?.trim() || '';
          const companyUrl = companyLinkEl?.getAttribute('href') || '';

          const location = item.querySelector('.job-search-card__location')?.textContent?.trim() || '';

          const datetimeAttr = item.querySelector('time')?.getAttribute('datetime') || '';
          const toDate = (str) => {
            const [y, m, d] = str.split('-');
            return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).toISOString();
          };
          const postedDate = datetimeAttr ? toDate(datetimeAttr) : null;

          let salaryMin = -1, salaryMax = -1, currency = '';
          const salaryInfo = item.querySelector('.job-search-card__salary-info')?.textContent?.trim();
          if (salaryInfo) {
            const salaryMap = { '€': 'EUR', '$': 'USD', '£': 'GBP' };
            const symbol = salaryInfo.charAt(0);
            currency = salaryMap[symbol] || symbol;
            const numbers = salaryInfo.match(/[\d,.]+/g);
            if (numbers?.[0]) salaryMin = parseFloat(numbers[0].replace(/,/g, ''));
            if (numbers?.[1]) salaryMax = parseFloat(numbers[1].replace(/,/g, ''));
          }

          const stackRequired = [...new Set(title.toLowerCase().split(/\s+/).concat(jobUrl.toLowerCase().split(/[-_/]/)).filter(w => stacks.includes(w)))];

          results.push({
            id: item.getAttribute('data-entity-urn') || '',
            title,
            img: imgSrc,
            url: jobUrl,
            company: companyName,
            companyUrl,
            city: location,
            location,
            date: new Date().toISOString(),
            postedDate,
            salaryCurrency: currency,
            salaryMin,
            salaryMax,
            descriptionHtml: '',
            remoteOk,
            stackRequired,
            countryCode: '',
            countryText: '',
            source: 'LinkedIn'
          });
        } catch (err) {
          console.error('⛔ Error extracting job item', err);
        }
      }

      return results;
    }, stacks);

    await browser.close();
    res.json(jobs);
  } catch (err) {
    console.error('🔥 Scraping failed:', err);
    res.status(500).json({ error: 'LinkedIn scraping failed' });
  }
});

//Working 
router.post('/scrape-tanitjobs', async (req, res) => {
  const { searchText, locationText = '', pageNumber = 0 } = req.body;

  try {
    const encodedKeywords = encodeURIComponent(searchText);
    const encodedLocation = encodeURIComponent(locationText);

    const tanitUrl = `https://www.tanitjobs.com/jobs/?listing_type%5Bequal%5D=Job&searchId=${Date.now()}&action=search&keywords%5Ball_words%5D=${encodedKeywords}&GooglePlace%5Blocation%5D%5Bvalue%5D=${encodedLocation}&GooglePlace%5Blocation%5D%5Bradius%5D=50`;

    const proxyUrl = `https://proxy.scrapeops.io/v1/?api_key=${process.env.SCRAPEOPS_API_KEY}&url=${encodeURIComponent(tanitUrl)}`;

    const response = await axios.get(proxyUrl);
    const html = response.data;

    const $ = cheerio.load(html);
    const articles = $('article.listing-item');
    const stacks = ['react', 'angular', 'vue', 'node', 'python', 'typescript', 'java', 'c#'];

    const results = [];

    articles.each((i, el) => {
      try {
        const item = $(el);
        const id = item.attr('id') || '';

        const titleEl = item.find('.listing-item__title a');
        const title = titleEl.text().trim();
        const url = titleEl.attr('href') || '';
        const jobUrl = url.startsWith('http') ? url : `https://www.tanitjobs.com${url}`;

        const imgSrc = item.find('.media-object.profile__img-company').attr('src') ||
          item.find('img.profile__img-company').attr('src') ||
          item.find('.listing-item__logo img').attr('src') || '';
          
        const companyName = item.find('.listing-item__info--item-company').text().trim();
        const location = item.find('.listing-item__info--item-location').text().trim();

        const description = item.find('.listing-item__desc').first().text().trim();
        const dateText = item.find('.listing-item__date').text().trim();

        const [day, month, year] = dateText.split('/');
        const postedDate = new Date(`${year}-${month}-${day}`).toISOString();

        const remoteOk = /remote|à distance|work from home/i.test(title + ' ' + description);

        const stackRequired = [...new Set(
          title.toLowerCase().split(/\s+/)
            .concat(description.toLowerCase().split(/\s+/))
            .concat(jobUrl.toLowerCase().split(/[-_/]/))
            .filter(w => stacks.includes(w))
        )];

        results.push({
          id,
          title,
          img: imgSrc,
          url: jobUrl,
          company: companyName,
          companyUrl: '', // TanitJobs doesn't always link to company profile
          city: location,
          location,
          date: new Date().toISOString(),
          postedDate,
          salaryCurrency: '',
          salaryMin: -1,
          salaryMax: -1,
          descriptionHtml: description,
          remoteOk,
          stackRequired,
          countryCode: '',
          countryText: '',
          source: 'TanitJobs'
        });
      } catch (err) {
        console.error('⛔ Error extracting a job item:', err.message);
      }
    });

    res.json(results);
  } catch (error) {
    console.error('🔥 TanitJobs scraping failed:', error.message);
    res.status(500).json({ error: 'TanitJobs scraping failed' });
  }
});


//Working fine 
router.post('/scrape-keejob', async (req, res) => {
  const { searchText, locationText = '', pageNumber = 0  } = req.body;

  try {
    const encodedKeywords = encodeURIComponent(searchText);
    const keejobUrl = `https://www.keejob.com/offres-emploi/?keywords=${encodedKeywords}`;
    const proxyUrl = `https://proxy.scrapeops.io/v1/?api_key=${process.env.SCRAPEOPS_API_KEY}&url=${encodeURIComponent(keejobUrl)}`;

    const response = await axios.get(proxyUrl);
    const html = response.data;
    const $ = cheerio.load(html);

    const results = [];

    $('.block_white_a.post.clearfix.silver-job-block').each((i, el) => {
      try {
        const item = $(el);

        const titleEl = item.find('h6 a');
        const title = titleEl.text().trim();
        const jobUrl = `https://www.keejob.com${titleEl.attr('href')}`;

        const companyLogo = item.find('figure.company-logo img').attr('src') || '';
        const img = companyLogo ? `https://www.keejob.com${companyLogo}` : '';

        const companyName = item.find('div.span12 a b').first().text().trim();
        const city = item.find('div.span12').text().match(/fa-map-marker.*?\s(.*?)\s/)?.[1]?.trim() || '';

        const description = item.find('div.span12 p').text().trim();

        const rawDate = item.find('.meta_a .fa-clock-o').parent().text().trim();
        const [day, month, year] = rawDate.split('/');
        const postedDate = new Date(`${year}-${month}-${day}`).toISOString();

        const remoteOk = /remote|à distance|work from home/i.test(title + ' ' + description);

        const stacks = ['react', 'angular', 'vue', 'node', 'python', 'typescript', 'java', 'c#'];
        const stackRequired = [...new Set(
          title.toLowerCase().split(/\s+/)
            .concat(description.toLowerCase().split(/\s+/))
            .concat(jobUrl.toLowerCase().split(/[-_/]/))
            .filter(w => stacks.includes(w))
        )];

        results.push({
          title,
          url: jobUrl,
          img,
          company: companyName,
          city,
          location: city,
          postedDate,
          date: new Date().toISOString(),
          descriptionHtml: description,
          remoteOk,
          stackRequired,
          salaryCurrency: '',
          salaryMin: -1,
          salaryMax: -1,
          countryCode: '',
          countryText: '',
          source: 'KeeJobs'
        });
      } catch (err) {
        console.error('⛔ Error extracting a job offer:', err.message);
      }
    });

    res.json(results);
  } catch (error) {
    console.error('🔥 Keejob scraping failed:', error.message);
    res.status(500).json({ error: 'Keejob scraping failed' });
  }
});



//Working 
async function scrapeIndeedJobs(searchText, locationText = '', pageNumber = 0) {
    const url = `https://www.indeed.com/jobs?q=${encodeURIComponent(searchText)}&l=${encodeURIComponent(locationText)}&start=${pageNumber * 10}`;
    const proxyUrl = getScrapeOpsUrl(url);

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(proxyUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    const jobs = await page.evaluate(() => {
        const cards = document.querySelectorAll('[data-testid="slider_item"]');
        const results = [];

        for (const card of cards) {
            try {
                const title = card.querySelector('h2')?.innerText?.trim() || '';
                const company = card.querySelector('[data-testid="company-name"]')?.innerText?.trim() || '';
                const location = card.querySelector('[data-testid="text-location"]')?.innerText?.trim() || '';
                const anchor = card.querySelector('a');
                const href = anchor?.getAttribute('href') || '';
                const url = href ? new URL(href, 'https://www.indeed.com').href : '';
                const snippet = card.querySelector('[data-testid="job-snippet"]')?.innerText?.trim() || '';

                results.push({
                    title,
                    company,
                    location,
                    url,
                    snippet,
                    source: 'Indeed'
                });
            } catch (err) {
                console.error('Error scraping Indeed job card:', err);
            }
        }

        return results;
    });

    await browser.close();
    return jobs;
}
router.post('/scrape-indeed', async (req, res) => {
    const { searchText, locationText = '', pageNumber = 0 } = req.body;
    try {
        const jobs = await scrapeIndeedJobs(searchText, locationText, pageNumber);
        console.log(`Scraped ${jobs.length} jobs from Indeed for "${searchText}" in "${locationText}" on page ${pageNumber}`);
        res.json(jobs);
    } catch (err) {
        console.error('🔥 Indeed scraping failed:', err);
        res.status(500).json({ error: 'Indeed scraping failed' });
    }
});



//NOT WORKING CHECK LATER -- getting an output but no jobs founds -- URL PROBLEM MAYBE
async function scrapeMonsterJobs(searchText, locationText = '', pageNumber = 1) {
  const q = encodeURIComponent(searchText);
  const where = encodeURIComponent(locationText);
  const url = `https://www.monster.com/jobs/search?q=${q}&where=${where}&page=${pageNumber}`;

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

  const jobs = await page.evaluate(() => {
    const jobCards = document.querySelectorAll('article[data-testid="JobCard"]');
    const results = [];

    jobCards.forEach(card => {
      try {
        const titleAnchor = card.querySelector('a[data-testid="jobTitle"]');
        const companySpan = card.querySelector('span[data-testid="company"]');
        const locationSpan = card.querySelector('span[data-testid="jobDetailLocation"]');

        const title = titleAnchor ? titleAnchor.innerText.trim() : '';
        const company = companySpan ? companySpan.innerText.trim() : '';
        const location = locationSpan ? locationSpan.innerText.trim() : '';
        let url = titleAnchor ? titleAnchor.getAttribute('href') : '';

        // Normalize URL: Monster uses protocol-relative URLs starting with //
        if (jobLink && jobLink.startsWith('//')) {
          jobLink = window.location.protocol + jobLink;
        } else if (jobLink && jobLink.startsWith('/')) {
          jobLink = window.location.origin + jobLink;
        }

        if (jobTitle) {
          results.push({
            title,
            company,
            location,
            url
          });
        }
      } catch (e) {
        console.error('Error scraping job card:', e);
      }
    });

    return results;
  });

  await browser.close();
  return jobs;
}

router.post('/scrape-monster', async (req, res) => {
  const { searchText = 'Devops', locationText = 'Miami, FL', pageNumber = 1 } = req.body;
  try {
    const jobs = await scrapeMonsterJobs(searchText, locationText, pageNumber);
    console.log(`Scraped ${jobs.length} jobs from Monster for "${searchText}" in "${locationText}" on page ${pageNumber}`);
    res.json(jobs);
  } catch (err) {
    console.error('🔥 Monster scraping failed:', err);
    res.status(500).json({ error: 'Monster scraping failed' });
  }
});

// NOT WORKING FIX ASAP





module.exports = router;
