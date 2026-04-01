import axios from "axios";
import cron from "node-cron";

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

let posted = [];

// Fetch news
async function getNews() {
  const url = `https://cryptonews-api.com/api/v1/category?section=general&items=5&token=${NEWS_API_KEY}`;
  const res = await axios.get(url);
  return res.data.data;
}

// Send message
async function sendMessage(text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  await axios.post(url, {
    chat_id: CHAT_ID,
    text,
    parse_mode: "Markdown",
  });
}

// Main logic
async function runBot() {
  try {
    console.log("Checking news...");

    const news = await getNews();

    for (let item of news) {
      if (!posted.includes(item.news_url)) {
        const msg = `🚨 *${item.title}*\n\n🔗 ${item.news_url}`;

        await sendMessage(msg);
        posted.push(item.news_url);

        console.log("Posted:", item.title);
        break;
      }
    }
  } catch (err) {
    console.log("Error:", err.message);
  }
}

// Run every 10 minutes
cron.schedule("*/10 * * * *", runBot);

// Run once immediately
runBot();
