import http from 'node:http';
import { chromium } from 'file:///C:/Users/mxz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const members = { '12345': { name: 'Ada Lovelace', balance: '$1,250.00' }, '67890': { name: 'Grace Hopper', balance: '$8,400.00' } };
export async function startTarget() {
  const server = http.createServer((req, res) => {
    const id = new URL(req.url, 'http://local').searchParams.get('member');
    const member = id && members[id];
    res.setHeader('Content-Type', 'text/html');
    res.end(`<!doctype html><title>Northstar Core</title><body><table border="1"><tr><td>Member Lookup</td></tr><tr><td><label for="mid">Member ID</label><input id="mid" name="member_id"></td></tr><tr><td><button onclick="location.href='/?member='+document.getElementById('mid').value">Search member</button></td></tr></table>${id ? (member ? `<table id="member-record"><caption>Member Details</caption><tr><th>Name</th><td>${member.name}</td></tr><tr><th>Current Savings Balance</th><td>${member.balance}</td></tr></table>` : `<div role="alert">Member record not found</div>`) : ''}</body>`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

export async function openSurface(origin) {
  // Use an installed enterprise browser in this dependency-light MVP; CI can omit executablePath.
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage();
  await page.goto(origin);
  return { browser, page, origin };
}
