import figlet from 'figlet';
import fs from 'fs/promises';
import { createInterface } from 'readline/promises';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import randomUseragent from 'random-useragent';
import ora from 'ora';
import chalk from 'chalk';
import moment from 'moment-timezone';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';

function getTimestamp() {
  return moment().tz('Asia/Jakarta').format('D/M/YYYY, HH:mm:ss');
}

function displayBanner() {
  const width = process.stdout.columns || 80;
  const banner = figlet.textSync('\n NT EXHAUST', { font: "ANSI Shadow", horizontalLayout: 'Speed' });
  banner.split('\n').forEach(line => {
    console.log(chalk.cyanBright(line.padStart(line.length + Math.floor((width - line.length) / 2))));
  });
  console.log(chalk.cyanBright(' '.repeat((width - 50) / 2) + '=== Telegram Channel 🚀 : NT Exhaust ( @NTExhaust ) ==='));
  console.log(chalk.yellowBright(' '.repeat((width - 30) / 2) + '✪ BOT MENTION NETWORK x QWEN ✪\n'));
}

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function promptUser(question) {
  const answer = await rl.question(chalk.white(question));
  return answer.trim();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function typeText(text, color, noType = false) {
  if (isSpinnerActive) await sleep(500);
  const maxLength = 80;
  const displayText = text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  if (noType) {
    console.log(color(` ┊ │ ${displayText}`));
    return;
  }
  const totalTime = 200;
  const sleepTime = displayText.length > 0 ? totalTime / displayText.length : 1;
  console.log(color(' ┊ ┌── Response Chat API ──'));
  process.stdout.write(color(' ┊ │ '));
  for (const char of displayText) {
    process.stdout.write(char);
    await sleep(sleepTime);
  }
  process.stdout.write('\n');
  console.log(color(' ┊ └──'));
}

function createProgressBar(current, total) {
  const barLength = 30;
  const filled = Math.round((current / total) * barLength);
  return `[${'█'.repeat(filled)}${' '.repeat(barLength - filled)} ${current}/${total}]`;
}

function displayHeader(text, color, forceClear = false) {
  if (isSpinnerActive) return;
  if (forceClear) console.clear();
  console.log(color(text));
}

async function clearConsoleLine() {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
}

let isSpinnerActive = false;

async function getUserInfo(bearerToken, proxy = null, retryCount = 0) {
  const maxRetries = 5;
  await clearConsoleLine();
  const spinner = ora({ text: chalk.cyan(` ┊ → Getting User Info${retryCount > 0 ? ` [Retry ke-${retryCount}/${maxRetries}]` : ''}`), prefixText: '', spinner: 'bouncingBar', interval: 120 }).start();
  isSpinnerActive = true;
  try {
    let config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
        'User-Agent': randomUseragent.getRandom(),
      },
    };
    if (proxy) {
      config.httpAgent = new HttpsProxyAgent(proxy);
      config.httpsAgent = new HttpsProxyAgent(proxy);
    }
    const response = await axios.get('https://api.mention.network/voyage/leaderboard?page=1&limit=100&period=all_time', config);
    const myRank = response.data.my_rank;
    if (!myRank || !myRank.user_id) throw new Error('Invalid response: user ID missing');
    const userData = {
      id: myRank.user_id,
      username: myRank.user_name || myRank.twitter_screen_name,
      totalPoints: myRank.total_points,
      rank: myRank.rank
    };
    spinner.succeed(chalk.green(` ┊ ✓ User Info Fetched Successfully`));
    await sleep(500);
    return userData;
  } catch (err) {
    if (retryCount < maxRetries - 1) {
      spinner.text = chalk.cyan(` ┊ → Getting User Info [Retry ke-${retryCount + 1}/${maxRetries}]`);
      await sleep(5000);
      return getUserInfo(bearerToken, proxy, retryCount + 1);
    }
    spinner.fail(chalk.red(` ┊ ✗ Failed Getting User Info: ${err.message}`));
    await sleep(500);
    throw err;
  } finally {
    spinner.stop();
    isSpinnerActive = false;
    await clearConsoleLine();
  }
}

async function getRecommendedQuestions(bearerToken, userId, proxy = null, retryCount = 0) {
  const maxRetries = 5;
  await clearConsoleLine();
  const spinner = ora({ text: chalk.cyan(` ┊ → Getting Recommended Questions${retryCount > 0 ? ` [Retry ke-${retryCount}/${maxRetries}]` : ''}`), prefixText: '', spinner: 'bouncingBar', interval: 120 }).start();
  isSpinnerActive = true;
  try {
    let config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
        'User-Agent': randomUseragent.getRandom(),
      },
    };
    if (proxy) {
      config.httpAgent = new HttpsProxyAgent(proxy);
      config.httpsAgent = new HttpsProxyAgent(proxy);
    }

    let response = await axios.get(`https://api.mention.network/questions/user/x2-point-recommendations?take=100&page=1&&&sort_type=ASC&`, config);
    let data = response.data;
    let questions = data.result?.data?.map(q => q.text) || [];
    if (!questions || questions.length === 0) {
      response = await axios.get(`https://api.mention.network/questions/user/recommendations??`, config);
      data = response.data;
      const categories = data.data || [];
      if (!categories || categories.length === 0) throw new Error('No recommended questions found');
      questions = categories.flatMap(category => category.questions.map(q => q.text));
    }

    if (!questions || questions.length === 0) throw new Error('No recommended questions found');

    spinner.succeed(chalk.green(` ┊ ✓ Recommended Questions Fetched Successfully`));
    await sleep(500);
    return questions;
  } catch (err) {
    if (retryCount < maxRetries - 1) {
      spinner.text = chalk.cyan(` ┊ → Getting Recommended Questions [Retry ke-${retryCount + 1}/${maxRetries}]`);
      await sleep(5000);
      return getRecommendedQuestions(bearerToken, userId, proxy, retryCount + 1);
    }
    spinner.fail(chalk.red(` ┊ ✗ Failed Getting Recommended Questions: ${err.message}`));
    await sleep(500);
    throw err;
  } finally {
    spinner.stop();
    isSpinnerActive = false;
    await clearConsoleLine();
  }
}

async function chatWithQwen(alibabaCloudApiKey, message, proxy = null, retryCount = 0) {
  const maxRetries = 5;
  await clearConsoleLine();
  const spinner = ora({ text: chalk.cyan(` ┊ → Sending Chat${retryCount > 0 ? ` [Retry ke-${retryCount}/${maxRetries}]` : ''}`), prefixText: '', spinner: 'bouncingBar', interval: 120 }).start();
  isSpinnerActive = true;
  try {
    let config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${alibabaCloudApiKey}`,
        'User-Agent': randomUseragent.getRandom(),
      },
    };
    if (proxy) {
      config.httpAgent = new HttpsProxyAgent(proxy);
      config.httpsAgent = new HttpsProxyAgent(proxy);
    }

    const payload = {
      model: 'qwen-plus',
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    };

    const response = await axios.post('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', payload, config);
    
    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid response from Qwen API');
    }

    const responseText = response.data.choices[0].message.content;
    
    if (!responseText) throw new Error('Invalid response: empty content');
    
    spinner.succeed(chalk.green(` ┊ ✓ Chat Sent`));
    await sleep(500);
    return responseText;
  } catch (err) {
    if (retryCount < maxRetries - 1) {
      spinner.text = chalk.cyan(` ┊ → Sending Chat [Retry ke-${retryCount + 1}/${maxRetries}]`);
      await sleep(5000);
      return chatWithQwen(alibabaCloudApiKey, message, proxy, retryCount + 1);
    }
    spinner.fail(chalk.red(` ┊ ✗ Failed Sending Chat to Qwen: ${err.message}`));
    await sleep(500);
    throw err;
  } finally {
    spinner.stop();
    isSpinnerActive = false;
    await clearConsoleLine();
  }
}

async function getAIModel(bearerToken, modelQuery, proxy = null, retryCount = 0) {
  const maxRetries = 5;
  await clearConsoleLine();
  const spinner = ora({ text: chalk.cyan(` ┊ → Searching AI Model (${modelQuery})${retryCount > 0 ? ` [Retry ke-${retryCount}/${maxRetries}]` : ''}`), prefixText: '', spinner: 'bouncingBar', interval: 120 }).start();
  isSpinnerActive = true;
  try {
    let config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
        'User-Agent': randomUseragent.getRandom(),
      },
    };
    if (proxy) {
      config.httpAgent = new HttpsProxyAgent(proxy);
      config.httpsAgent = new HttpsProxyAgent(proxy);
    }
    const response = await axios.get(`https://api.mention.network/api/ai-models/search?query=${modelQuery}`, config);
    const modelData = response.data.data[0];
    if (!modelData || !modelData.id) throw new Error('No model found');
    spinner.succeed(chalk.green(` ┊ ✓ AI Model Fetched: ${modelData.name}`));
    await sleep(500);
    return modelData.id;
  } catch (err) {
    if (retryCount < maxRetries - 1) {
      spinner.text = chalk.cyan(` ┊ → Searching AI Model (${modelQuery}) [Retry ke-${retryCount + 1}/${maxRetries}]`);
      await sleep(5000);
      return getAIModel(bearerToken, modelQuery, proxy, retryCount + 1);
    }
    spinner.fail(chalk.red(` ┊ ✗ Failed Searching AI Model: ${err.message}`));
    await sleep(500);
    throw err;
  } finally {
    spinner.stop();
    isSpinnerActive = false;
    await clearConsoleLine();
  }
}

function generateKey(userId, timestamp) {
  const hourStart = 3600000 * Math.floor(timestamp / 3600000);
  const hourEnd = hourStart + 3600000;
  const mod = (1337 * userId + (hourStart % 10000)) % 9999;
  return [
    (hourStart + 1).toString(),
    hourEnd.toString(),
    (userId * mod).toString(),
    (hourStart * userId % 1000000).toString()
  ].join('|');
}

async function submitInteraction(bearerToken, userId, modelId, requestText, responseText, proxy = null, retryCount = 0) {
  const maxRetries = 5;
  await clearConsoleLine();
  const spinner = ora({ text: chalk.cyan(` ┊ → Submitting Interaction${retryCount > 0 ? ` [Retry ke-${retryCount}/${maxRetries}]` : ''}`), prefixText: '', spinner: 'bouncingBar', interval: 120 }).start();
  isSpinnerActive = true;
  try {
    let config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearerToken}`,
        'User-Agent': randomUseragent.getRandom(),
      },
    };
    if (proxy) {
      config.httpAgent = new HttpsProxyAgent(proxy);
      config.httpsAgent = new HttpsProxyAgent(proxy);
    }
    const payloadWithoutSignature = {
      userId,
      modelId,
      requestText,
      responseText,
      metadata: { hasSearch: false, hasDeepSearch: false },
    };
    const now = Date.now();
    const key = generateKey(userId, now);
    const sortedKeys = Object.keys(payloadWithoutSignature).sort();
    const sortedJson = JSON.stringify(payloadWithoutSignature, sortedKeys);
    const signature = CryptoJS.HmacSHA256(sortedJson, key).toString(CryptoJS.enc.Hex);
    const payload = {
      ...payloadWithoutSignature,
      signature,
    };
    const response = await axios.post('https://api.mention.network/interactions', payload, config);
    if (!response.data.aiResponse) throw new Error('Invalid response: aiResponse missing');
    spinner.succeed(chalk.green(` ┊ ✓ Interaction Submitted Successfully`));
    await sleep(500);
    return response.data;
  } catch (err) {
    if (retryCount < maxRetries - 1) {
      spinner.text = chalk.cyan(` ┊ → Submitting Interaction [Retry ke-${retryCount + 1}/${maxRetries}]`);
      await sleep(5000);
      return submitInteraction(bearerToken, userId, modelId, requestText, responseText, proxy, retryCount + 1);
    }
    spinner.fail(chalk.red(` ┊ ✗ Failed Submitting Interaction: ${err.message}`));
    await sleep(500);
    throw err;
  } finally {
    spinner.stop();
    isSpinnerActive = false;
    await clearConsoleLine();
  }
}

const models = ['gpt-3-5', 'gemini-2.5-flash', 'grok-4', 'deepseek_default'];

let lastCycleEndTime = null;

function startCountdown(nextRunTime) {
  const countdownInterval = setInterval(() => {
    if (isSpinnerActive) return;
    const now = moment();
    const timeLeft = moment.duration(nextRunTime.diff(now));
    if (timeLeft.asSeconds() <= 0) {
      clearInterval(countdownInterval);
      return;
    }
    clearConsoleLine();
    const hours = Math.floor(timeLeft.asHours()).toString().padStart(2, '0');
    const minutes = Math.floor(timeLeft.asMinutes() % 60).toString().padStart(2, '0');
    const seconds = Math.floor(timeLeft.asSeconds() % 60).toString().padStart(2, '0');
    process.stdout.write(chalk.cyan(` ┊ ⏳ Waiting Next Loop: ${hours}:${minutes}:${seconds}\r`));
  }, 1000);
}

async function processAccounts(accounts, accountProxies, chatCount, noType) {
  let successCount = 0;
  let failCount = 0;
  let successfulChats = 0;
  let failedChats = 0;

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    const proxy = accountProxies[i];
    const shortToken = `${account.bearer.slice(0, 8)}...${account.bearer.slice(-6)}`;

    displayHeader(`═════[ Account ${i + 1}/${accounts.length} | @ ${getTimestamp()} ]═════`, chalk.blue);
    console.log(chalk.cyan(` ┊ ${proxy ? `Used Proxy: ${proxy}` : 'Not Using Proxy'}`));

    try {
      const userInfo = await getUserInfo(account.bearer, proxy);
      const username = userInfo.username;
      const userId = userInfo.id;

      console.log(chalk.yellow(' ┊ ┌── User Information ──'));
      console.log(chalk.white(` ┊ │ Username: ${username}`));
      console.log(chalk.white(` ┊ │ User ID: ${userId}`));
      console.log(chalk.yellow(' ┊ └──'));

      let questions = await getRecommendedQuestions(account.bearer, userId, proxy);
      questions = questions.sort(() => 0.5 - Math.random());
      const uniqueQuestions = questions.slice(0, chatCount);

      console.log(chalk.magentaBright(' ┊ ┌── Proses Chat ──'));
      let currentChat = 0;
      let usedAgents = [];
      let modelIndex = 0;

      for (let j = 0; j < chatCount; j++) {
        currentChat++;
        console.log(chalk.yellow(` ┊ ├─ Chat ${createProgressBar(currentChat, chatCount)} ──`));
        const message = uniqueQuestions[j] || questions[crypto.randomInt(0, questions.length)];
        console.log(chalk.white(` ┊ │ Message: ${message}`));
        try {
          const aiResponse = await chatWithQwen(account.alibabaCloudApiKey, message, proxy);
          await typeText(aiResponse, chalk.green, noType);

          const modelQuery = models[modelIndex % models.length];
          usedAgents.push(modelQuery);
          const modelId = await getAIModel(account.bearer, modelQuery, proxy);
          modelIndex++;

          await submitInteraction(account.bearer, userId, modelId, message, aiResponse, proxy);
          successfulChats++;
          console.log(chalk.yellow(' ┊ └──'));
        } catch (chatErr) {
          console.log(chalk.red(` ┊ ✗ Chat ${j + 1} gagal: ${chatErr.message}`));
          failedChats++;
          console.log(chalk.yellow(' ┊ └──'));
        }
        await sleep(15000);
      }
      console.log(chalk.yellow(' ┊ └──'));

      const finalUserInfo = await getUserInfo(account.bearer, proxy);
      const finalUsername = finalUserInfo.username;
      const finalUserId = finalUserInfo.id;
      const totalPoint = finalUserInfo.totalPoints;
      const rank = finalUserInfo.rank;

      console.log(chalk.yellow(' ┊ ┌── Final User Information ──'));
      console.log(chalk.white(` ┊ │ Username: ${finalUsername}`));
      console.log(chalk.white(` ┊ │ User ID: ${finalUserId}`));
      console.log(chalk.white(` ┊ │ Total Points: ${totalPoint}`));
      console.log(chalk.white(` ┊ │ Rank: ${rank}`));
      console.log(chalk.yellow(' ┊ └──'));

      console.log(chalk.yellow(' ┊ ┌── Agents Used ──'));
      let agentCounts = {};
      usedAgents.forEach(agent => {
        if (!agentCounts[agent]) agentCounts[agent] = 0;
        agentCounts[agent]++;
      });
      Object.entries(agentCounts).forEach(([agent, count]) => {
        console.log(chalk.white(` ┊ │    ${agent}:  ${count}`));
      });
      console.log(chalk.yellow(' ┊ └──'));

      if (successfulChats > 0) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (err) {
      console.log(chalk.red(` ┊ ✗ Error: ${err.message}`));
      failCount++;
    }

    console.log(chalk.gray(' ┊ ══════════════════════════════════════'));
  }

  lastCycleEndTime = moment();
  displayHeader(`═════[ Selesai @ ${getTimestamp()} ]═════`, chalk.blue, false);
  console.log(chalk.gray(` ┊ ✅ ${successCount} akun sukses, ❌ ${failCount} akun gagal`));
  const nextRunTime = moment().add(24, 'hours');
  startCountdown(nextRunTime);
}

let isProcessing = false;

function scheduleNextRun(accounts, accountProxies, chatCount, noType) {
  const delay = 24 * 60 * 60 * 1000;
  console.log(chalk.cyan(` ┊ ⏰ Proses akan diulang setiap 24 jam...`));
  setInterval(async () => {
    if (isProcessing || isSpinnerActive) return;
    try {
      isProcessing = true;
      const nextRunTime = moment().add(24, 'hours');
      await processAccounts(accounts, accountProxies, chatCount, noType);
      startCountdown(nextRunTime);
    } catch (err) {
      console.log(chalk.red(` ✗ Error selama siklus: ${err.message}`));
    } finally {
      isProcessing = false;
    }
  }, delay);
}

async function main() {
  console.log('\n');
  displayBanner();
  const noType = process.argv.includes('--no-type');
  let accounts = [];
  try {
    const accountsData = await fs.readFile('account.json', 'utf8');
    accounts = JSON.parse(accountsData);
    if (!Array.isArray(accounts) || accounts.length === 0) {
      throw new Error('Invalid or empty account.json');
    }
  } catch (err) {
    console.log(chalk.red('✗ File account.json tidak ditemukan atau tidak valid! Pastikan berisi token bearer dan alibabaCloudApiKey.'));
    rl.close();
    return;
  }

 let chatCount;
  while (true) {
    const input = await promptUser('Masukkan jumlah chat per akun: ');
    chatCount = parseInt(input, 10);
    if (!isNaN(chatCount) && chatCount > 0) break;
    console.log(chalk.red('✗ Masukkan angka yang valid (minimal 1)!'));
  }

  let useProxy;
  while (true) {
    const input = await promptUser('Gunakan proxy? (y/n) ');
    if (input.toLowerCase() === 'y' || input.toLowerCase() === 'n') {
      useProxy = input.toLowerCase() === 'y';
      break;
    }
    console.log(chalk.red('✗ Masukkan "y" atau "n"!'));
  }

  let proxies = [];
  if (useProxy) {
    try {
      const proxyData = await fs.readFile('proxy.txt', 'utf8');
      proxies = proxyData.split('\n').filter(line => line.trim() !== '');
      if (proxies.length === 0) {
        console.log(chalk.yellow('✗ File proxy.txt kosong. Lanjut tanpa proxy.'));
      }
    } catch (err) {
      console.log(chalk.yellow('✗ File proxy.txt tidak ditemukan. Lanjut tanpa proxy.'));
    }
  }

  const accountProxies = accounts.map((_, index) => proxies.length > 0 ? proxies[index % proxies.length] : null);

  console.log(chalk.cyan(` ┊ ⏰ Memulai proses untuk ${accounts.length} akun...`));
  await processAccounts(accounts, accountProxies, chatCount, noType);
  scheduleNextRun(accounts, accountProxies, chatCount, noType);
  rl.close();
}

main();
