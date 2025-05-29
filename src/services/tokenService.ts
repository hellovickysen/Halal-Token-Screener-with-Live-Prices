import axios from 'axios';
import puppeteer from 'puppeteer';

interface TokenData {
  name: string;
  symbol: string;
  status: string;
  reasons: string[];
}

const ADMIN_URL = 'https://admin.mrhb.network/dashboard/shariah-tokens/pending';

export const scrapeTokenData = async (credentials: { username: string; password: string }): Promise<TokenData[]> => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    // Navigate to login page
    await page.goto(ADMIN_URL);

    // Login
    await page.type('input[name="username"]', credentials.username);
    await page.type('input[name="password"]', credentials.password);
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForNavigation();

    // Get all token links
    const tokenLinks = await page.$$eval('a[href*="shariah-tokens"]', links =>
      links.map(link => link.href)
    );

    const tokens: TokenData[] = [];

    // Visit each token page
    for (const link of tokenLinks) {
      await page.goto(link);
      
      // Extract token data
      const tokenData = await page.evaluate(() => {
        const name = document.querySelector('.token-name')?.textContent || '';
        const symbol = document.querySelector('.token-symbol')?.textContent || '';
        const status = document.querySelector('.token-status')?.textContent || '';
        const reasons = Array.from(document.querySelectorAll('.token-reason'))
          .map(el => el.textContent || '');

        return { name, symbol, status, reasons };
      });

      tokens.push(tokenData);
    }

    return tokens;
  } finally {
    await browser.close();
  }
};

export const fetchTokenData = async (): Promise<TokenData[]> => {
  try {
    const response = await axios.get('/api/tokens');
    return response.data;
  } catch (error) {
    console.error('Error fetching token data:', error);
    throw error;
  }
};