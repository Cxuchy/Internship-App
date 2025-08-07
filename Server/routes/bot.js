require('dotenv').config();
const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const querystring = require('querystring');
const puppeteer = require('puppeteer-extra');

const User = require('../models/user.model');

puppeteer.use(StealthPlugin());

// 1. Scrape function -- SCRAPING FOR LINKEDIN JOBS
async function scrapeWebsite(searchText) {
  const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/f_TPR=r86400&keywords=${encodeURIComponent(searchText)}&origin=JOB_SEARCH_PAGE_JOB_FILTER&refresh=true`;

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

          const stackRequired = [...new Set(title.toLowerCase().split(/\s+/)
            .concat(jobUrl.toLowerCase().split(/[-_/]/))
            .filter(w => stacks.includes(w)))];

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
    //console.log("jobs", jobs);

    return jobs;

  } catch (err) {
    console.error('🔥 Scraping failed:', err);
    return []; // Optional fallback if scraping fails
  }
}


// 3. Send email function -- RECEIVED JOBS
async function sendEmail(receiver, jobList = []) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Generate HTML content from job list
  const jobHtml = jobList.map(job => `
    <div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #ccc;">
      <h3 style="margin: 0;">🔹 <a href="${job.url}" target="_blank">${job.title}</a></h3>
      <p style="margin: 5px 0;"><strong>Company:</strong> <a href="${job.companyUrl}" target="_blank">${job.company}</a></p>
      <p style="margin: 5px 0;"><strong>Location:</strong> ${job.location}</p>
      <p style="margin: 5px 0;"><strong>Posted:</strong> ${new Date(job.postedDate).toDateString()}</p>
      ${job.stackRequired.length > 0 ? `<p><strong>Stack:</strong> ${job.stackRequired.join(', ')}</p>` : ''}
      ${job.remoteOk ? `<p><strong>Remote Friendly:</strong> ✅</p>` : ''}
    </div>
  `).join('');

  const mailOptions = {
    to: receiver,
    subject: '🔔 New LinkedIn Job Offers',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #0073b1;">🔎 Job Offers Matching Your Search</h2>
        ${jobHtml || '<p>No new jobs found.</p>'}
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`📤 Email sent to ${receiver}`);
}



async function startBot() {
  const users = await User.find();

  console.log(`Found ${users.length} users to notify.`);
  users.forEach(user => {
    if (typeof user.schedule === 'string' && user.schedule.trim() !== '') {

      cron.schedule(user.schedule, async () => {
        console.log(`⏰ Running task for ${user.email}`);
        try {

          let results = await scrapeWebsite(user.keyword);
          const now = new Date();
          const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
          const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

          //Condition test -- EVERY HOUR / DAY 
          //hour 
          //hour 
          //hour 
          //hour 0 * * * *

          // test ev minute */1 * * * *
          if (user.schedule === '0 * * * *') {  
            results = results.filter(job => {
              if (!job.postedDate) return false;
              return new Date(job.postedDate) >= oneHourAgo;
            });

          }
          //day  
          // 0 0 * * *
          else if (user.schedule === '0 0 * * *') {
            results = results.filter(job => {
              if (!job.postedDate) return false;
              return new Date(job.postedDate) >= oneDayAgo;
            });

          }

          console.log(`🔍 Scraped ${results.length} jobs for ${user.keyword}`);
          if (results.length != 0) {
            await sendEmail(user.email, results);

          }
          else {
            console.log(`🔍 NO JOBS SCRAPED FOR THE LAST ${user.schedule} FOR ${user.keyword}`);

          }



          const log = {
            title: user.keyword, // can be extracted more accurately if needed
            location: 'Remote', // placeholder - update with actual location if scraped
            //status: status,
            checkedAt: Date.now()
          };

          await User.findByIdAndUpdate(user._id, {
            $set: { lastChecked: Date.now() },
            $push: { jobLogs: log }
          });




        } catch (err) {
          console.error(`❌ Error for ${user.email}:`, err.message);
        }
      });

      console.log(`📅 Scheduled task for ${user.email}`);


    } else {
      console.warn(`User ${user.email} has invalid or missing schedule:`, user.schedule);

    }

  });
}




module.exports = { startBot };