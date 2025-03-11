import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class SCPService {
  // Method to fetch data and parse the HTML for card information
  async searchCard(searchQuery: string): Promise<any> {
    // URL encode the search query to handle spaces and special characters
    const encodedQuery = encodeURIComponent(searchQuery);
    const url = `https://www.sportscardspro.com/search-products?q=${encodedQuery}&type=prices`;

    try {
      // Fetch the HTML content of the page
      const response = await axios.get(url, {
        headers: {
          Accept: 'text',
        },
      });
      const html = response;
      // Use Cheerio to parse the HTML
      const $ = cheerio.load(html.data);

      const hrefValue = $('link[rel="canonical"]').attr('href');
      if (
        !hrefValue.startsWith('https://www.sportscardspro.com/search-products')
      ) {
        return [
          {
            title: $('title').text(),
            link: hrefValue,
          },
        ];
      }

      // Array to hold the results
      const results = [];
      // Loop through each row in the table (excluding the header)
      $('#games_table tbody tr').each((index, element) => {
        // Extract title and link from each row
        const titleElement = $(element).find('.title');
        const firstAnchor = titleElement.find('a').first();
        let title = firstAnchor.text().trim();

        const setElement = $(element).find('.console');
        const setAnchor = setElement.find('a').first();
        const set = setAnchor.text().trim();

        const imageElement = $(element).find('.image');
        const imageEle = imageElement.find('img').first();
        const imageUrl = imageEle.attr('src');

        // Check if there's a span with class "rookie" in the same title cell
        if (titleElement.find('span.rookie').length > 0) {
          title = `${title} [RC]`;
        }

        const link = $(element).find('.title a').attr('href');

        if (title && link) {
          results.push({
            title,
            set,
            imageUrl,
            link: `${link}`,
          }); // Construct the full URL
        }
      });

      return results;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw new Error('Unable to fetch or parse card data');
    }
  }

  async loadCardDetails(urlPath: string): Promise<any> {
    try {
      // Fetch the HTML content of the page
      const response = await axios.get(urlPath, {
        headers: {
          Accept: 'text',
        },
      });
      const html = response;
      // Use Cheerio to parse the HTML
      const $ = cheerio.load(html.data);

      const details: Record<string, number | string | null> = {};
      details['cardSet'] = $('#product_name a').text().trim();
      details['imageUrl'] = $('#product_details .cover img').attr('src');

      // Select the h1 element with the class "chart_title"
      const heading = $('h1.chart_title').first();

      // Extract the text content and trim it
      const fullText = heading?.contents().first().text().trim();

      // Remove the last word (the card number) using regex
      details['playerName'] = fullText
        .split('#')[0]
        .trim()
        .split('[')[0]
        .trim();

      details['epid'] = $('#full_details td.title')
        .filter((i, el) => $(el).text().trim() === 'ePID (eBay):')
        .next('td.details')
        .text()
        .trim();

      // Loop through each row in the price table
      $('#full-prices table tbody tr').each((_, row) => {
        const gradeText = $(row).find('td').first().text().trim(); // Get grade text
        const priceText = $(row)
          .find('.js-price')
          .text()
          .trim()
          .replace('$', '')
          .replace(',', ''); // Get price

        // Convert grade text into a camelCase key for the object
        const gradeKey = gradeText
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, ' ') // Remove special characters
          .trim()
          .replace(/\s+/g, '_'); // Replace spaces with underscores

        // Convert price to a number or set to null if unavailable
        details[gradeKey] = priceText === '-' ? null : parseFloat(priceText);
      });

      return details;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw new Error('Unable to fetch or parse card data');
    }
  }
}
