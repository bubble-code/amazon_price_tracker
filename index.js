const axios = require('axios')
const cheerio = require('cheerio')
const cron = require('node-cron')
const nodemailer = require('nodemailer')

const fetchPrice = async (url, taretPrice) => {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const priceText = $('#priceblock_ourprice').text();
    const price = parseFloat(priceText.replace(/[€$]/g, '').replace(',', '.'));
    if (taretPrice >= price)
        sendEmail(url, price)
    else console.log("too expensive")
}
const sendEmail = async (url, price) => {
    const testAccount = await nodemailer.createTestAccount();
    const transport = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        }
    });
    const info = await transport.sendMail({
        from: '"UI Infinity" <mio@mio.com>',
        to: 'mio@mio.com',
        subject: 'amazon watcher',
        text: `${price} - ${url}`,
        html: `<p>${price}</p><p>${url}</p>`,
    })
    console.log(nodemailer.getTestMessageUrl(info));
}

const watchPrice = (priceTarget, url, schedule = '*/5 * * * * *') => {
    cron.schedule(schedule, () => fetchPrice(url, priceTarget));
}

watchPrice(
    34.99,
    'https://www.amazon.es/dp/B07PHPXHQS/ref=gw_es_desk_h1_aucc_cr_qh_0720_price?pf_rd_r=YHJ2HAS6M3764EZSMED7&pf_rd_p=6db291ed-8641-46da-a4d9-b4c556d5767e',

);