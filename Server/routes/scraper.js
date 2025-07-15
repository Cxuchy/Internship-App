const express = require('express');
const puppeteer = require('puppeteer');

const router = express.Router();

router.post('/scrape-from-url', async (req, res) => {
    const { url } = req.body;

    if (!url || !url.startsWith('http')) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        );

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




// Utility
const stacks = ['angularjs', 'kubernetes', 'javascript', 'jenkins', 'html']; // Add more as needed

// router.post('/scrape-linkedin', async (req, res) => {
//   const { searchText, locationText = '', pageNumber = 0 } = req.body;

//   const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(searchText)}&start=${pageNumber * 25}${locationText ? '&location=' + encodeURIComponent(locationText) : ''}`;

//   try {
//     const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

//     const jobs = await page.evaluate((stacks) => {
//       const collection = document.body.children;
//       const results = [];

//       for (let i = 0; i < collection.length; i++) {
//         try {
//           const item = collection.item(i);
//           const title = item.querySelector('.base-search-card__title')?.textContent?.trim() || '';
//           const imgSrc = item.querySelector('img')?.getAttribute('data-delayed-url') || '';
//           const remoteOk = /remote|No office location/gi.test(title);

//           const url = item.querySelector('.base-card__full-link, .base-search-card--link')?.href || '';
//           const companyContainer = item.querySelector('.base-search-card__subtitle');
//           const companyName = companyContainer?.textContent?.trim() || '';
//           const companyUrl = companyContainer?.querySelector('a')?.href || '';
//           const location = item.querySelector('.job-search-card__location')?.textContent?.trim() || '';


//           const dateAttr = item.querySelector('.job-search-card__listdate, .job-search-card__listdate--new')?.getAttribute('datetime') || '';
//           const toDate = (str) => {
//             const [y, m, d] = str.split('-');
//             return new Date(parseFloat(y), parseFloat(m) - 1, parseFloat(d)).toISOString();
//           };
//           const postedDate = toDate(dateAttr);

//           let salaryMin = -1, salaryMax = -1, currency = '';
//           const salaryInfo = item.querySelector('.job-search-card__salary-info')?.textContent?.trim();
//           if (salaryInfo) {
//             const salaryMap = { '€': 'EUR', '$': 'USD', '£': 'GBP' };
//             const symbol = salaryInfo.charAt(0);
//             currency = salaryMap[symbol] || symbol;
//             const numbers = salaryInfo.match(/[\d,.]+/g);
//             if (numbers?.[0]) salaryMin = parseFloat(numbers[0].replace(/,/g, ''));
//             if (numbers?.[1]) salaryMax = parseFloat(numbers[1].replace(/,/g, ''));
//           }

//           const stackRequired = [...new Set(title.split(' ').concat(url.split('-')).map(w => w.toLowerCase()).filter(w => stacks.includes(w)))];

//           results.push({
//             id: item.children[0].getAttribute('data-entity-urn'),
//             title,
//             img: imgSrc,
//             url,
//             company: companyName,
//             companyUrl,
//             city: location,
//             location,
//             date: new Date().toISOString(),
//             postedDate,
//             salaryCurrency: currency,
//             salaryMin,
//             salaryMax,
//             descriptionHtml: '',
//             remoteOk,
//             stackRequired,
//             countryCode: '',
//             countryText: ''
//           });
//         } catch (err) {
//           console.error('⛔ Error extracting job item', err);
//         }
//       }

//       return results;
//     }, stacks);

//     await browser.close();
//     res.json(jobs);
//   } catch (err) {
//     console.error('🔥 Scraping failed:', err);
//     res.status(500).json({ error: 'LinkedIn scraping failed' });
//   }
// });

router.post('/scrape-linkedin', async (req, res) => {
  const { searchText, locationText = '', pageNumber = 0 } = req.body;

  const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(searchText)}&start=${pageNumber * 25}${locationText ? '&location=' + encodeURIComponent(locationText) : ''}`;

  try {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    const stacks = ['react', 'angular', 'vue', 'node', 'python', 'typescript', 'java', 'c#']; // example stack list

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
            countryText: ''
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





module.exports = router;
