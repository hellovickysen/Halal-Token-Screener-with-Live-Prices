import axios from 'axios';
import puppeteer from 'puppeteer';

interface TokenData {
  name: string;
  symbol: string;
  status: 'halal' | 'haram' | 'pending';
  reasons: string[];
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
}

const ADMIN_URL = 'https://admin.mrhb.network/dashboard/shariah-tokens/pending';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export const scrapeTokenData = async (credentials: { username: string; password: string }): Promise<TokenData[]> => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    // Navigate to login page
    await page.goto(ADMIN_URL);

    // Login
    await page.type('input[name="email"]', credentials.username);
    await page.type('input[name="password"]', credentials.password);
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForNavigation();

    // Get all token links
    const tokenLinks = await page.$$eval('a[href*="shariah-tokens"]', links =>
      links.map(link => link.href)
    );

    const tokens: Partial<TokenData>[] = [];

    // Visit each token page
    for (const link of tokenLinks) {
      await page.goto(link);
      
      // Extract token data
      const tokenData = await page.evaluate(() => {
        const name = document.querySelector('.token-name')?.textContent || '';
        const symbol = document.querySelector('.token-symbol')?.textContent || '';
        const status = document.querySelector('.token-status')?.textContent?.toLowerCase() as 'halal' | 'haram' | 'pending';
        const reasons = Array.from(document.querySelectorAll('.token-reason'))
          .map(el => el.textContent || '');

        return { name, symbol, status, reasons };
      });

      tokens.push(tokenData);
    }

    // Fetch price data from CoinGecko
    const enrichedTokens = await Promise.all(
      tokens.map(async (token) => {
        try {
          const response = await axios.get(`${COINGECKO_API}/simple/price`, {
            params: {
              ids: token.name?.toLowerCase(),
              vs_currencies: 'usd',
              include_24hr_change: true,
              include_market_cap: true,
              include_24hr_vol: true,
            }
          });

          const priceData = response.data[token.name?.toLowerCase()];
          return {
            ...token,
            price: priceData?.usd || 0,
            priceChange24h: priceData?.usd_24h_change || 0,
            marketCap: priceData?.usd_market_cap || 0,
            volume24h: priceData?.usd_24h_vol || 0,
          } as TokenData;
        } catch (error) {
          console.error(`Error fetching price data for ${token.name}:`, error);
          return token as TokenData;
        }
      })
    );

    return enrichedTokens;
  } finally {
    await browser.close();
  }
};

export const searchTokens = async (query: string): Promise<TokenData[]> => {
  const tokens = await scrapeTokenData({
    username: 'vickysen126@gmail.com',
    password: 'Hello@vickysen1'
  });
  
  return tokens.filter(token => 
    token.name.toLowerCase().includes(query.toLowerCase()) ||
    token.symbol.toLowerCase().includes(query.toLowerCase())
  );
};