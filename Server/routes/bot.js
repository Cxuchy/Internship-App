require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

// 1. Scrape function -- change to scraping target website 
async function scrapeWebsite() {
  const url = 'https://example.com'; // change this to your target URL
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  // Example: Get the text of a specific element
  const scrapedValue = $('h1').text();

  console.log('Scraped:', scrapedValue);

  // 2. Check condition
  if (scrapedValue.includes("Sale")) {
    await sendEmail(scrapedValue);
  }
}

// 3. Send email function
async function sendEmail(receiver,message) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: receiver,
    subject: '🔔 Alert from your bot',
    text: `Condition met:\n\n${message}`
  };

  await transporter.sendMail(mailOptions);
  console.log('✅ Email sent!');
}

// 4. Schedule job: every hour
cron.schedule('0 * * * *', async () => {
  console.log('⏰ Running scrape at', new Date().toLocaleString());
  try {
    await scrapeWebsite();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
});

console.log('🤖 Bot started...');
