import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ComcSalePrices } from './comc-sales-prices.entity';
import puppeteer from 'puppeteer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from 'src/cards/card.entity';

@Injectable()
export class ComcService {
  constructor(
    @InjectRepository(ComcSalePrices)
    private comcRepository: Repository<ComcSalePrices>,
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
  ) {}

  // Function to create or update ComcSalePrices
  async createOrUpdateComcSalePrices(
    comcSalePricesData: Partial<ComcSalePrices>,
  ): Promise<any> {
    const saleId = comcSalePricesData.id;
    const cardId = comcSalePricesData.card?.id;

    let sale = saleId
      ? await this.comcRepository.findOne({
          where: { id: saleId },
          relations: ['card'],
        })
      : undefined;
    console.log('saleId: ' + saleId);
    if (sale) {
      console.log('updating sale: ' + saleId);
      sale.ungraded = comcSalePricesData.ungraded;
      sale.psa_grade_1 = comcSalePricesData.psa_grade_1;
      sale.psa_grade_2 = comcSalePricesData.psa_grade_2;
      sale.psa_grade_3 = comcSalePricesData.psa_grade_3;
      sale.psa_grade_4 = comcSalePricesData.psa_grade_4;
      sale.psa_grade_5 = comcSalePricesData.psa_grade_5;
      sale.psa_grade_6 = comcSalePricesData.psa_grade_6;
      sale.psa_grade_7 = comcSalePricesData.psa_grade_7;
      sale.psa_grade_8 = comcSalePricesData.psa_grade_8;
      sale.psa_grade_9 = comcSalePricesData.psa_grade_9;
      sale.psa_grade_10 = comcSalePricesData.psa_grade_10;
      sale.other_grade_1 = comcSalePricesData.other_grade_1;
      sale.other_grade_2 = comcSalePricesData.other_grade_2;
      sale.other_grade_3 = comcSalePricesData.other_grade_3;
      sale.other_grade_4 = comcSalePricesData.other_grade_4;
      sale.other_grade_5 = comcSalePricesData.other_grade_5;
      sale.other_grade_6 = comcSalePricesData.other_grade_6;
      sale.other_grade_7 = comcSalePricesData.other_grade_7;
      sale.other_grade_8 = comcSalePricesData.other_grade_8;
      sale.other_grade_9 = comcSalePricesData.other_grade_9;
      sale.other_grade_10 = comcSalePricesData.other_grade_10;
      return this.comcRepository.save(sale);
    } else {
      console.log('creating new sale');
      const card = await this.cardsRepository.findOne({
        where: { id: cardId },
      });

      if (!card) {
        throw new Error('card not found');
      }
      delete comcSalePricesData.id;
      console.log('cardid: ' + comcSalePricesData.card.id);
      sale = this.comcRepository.create({
        ...comcSalePricesData,
        card: { id: card.id },
      });
      return this.comcRepository.save(sale);
    }
  }

  async scrapeComcPages(
    cardsToScrape: {
      cookie: string | null;
      comcSetName: string;
      playerName: string;
      cardNumber: string;
    }[],
  ) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.comc.com', {
      waitUntil: 'domcontentloaded',
    });

    const linkText = 'Sign In / Sign Up';
    const linkExists = await page.evaluate((text) => {
      const link = Array.from(document.querySelectorAll('a')).find((a) =>
        a.textContent.includes(text),
      );
      if (link) {
        link.click();
        return true;
      }
      return false;
    }, linkText);

    if (linkExists) {
      // Wait for navigation to complete
      await page.waitForNavigation();
      console.log('Navigated to the next page.');
    } else {
      console.log(`Link with text "${linkText}" not found`);
    }

    // Example: Extracting page title
    const title = await page.title();
    console.log(title);
    const content = await page.content();
    console.log(content);

    await browser.close();
  }

  async getSalesPrices(
    cookie: string | null,
    comcSetName: string,
    playerName: string,
    cardNumber: string,
  ): Promise<ComcSalePrices> {
    await this.scrapeComcPages([]);
    return null;
    // const sales = await this.queryComc(
    //   comcSetName + ' ' + playerName + ' #' + cardNumber,
    //   null,
    // );
    // console.log(JSON.stringify(sales));
    // const results = sales.filter((sale) => {
    //   return (
    //     sale.cardNumber.toUpperCase() === cardNumber.toUpperCase() &&
    //     sale.setName.toUpperCase() === comcSetName.toUpperCase()
    //   );
    // });

    // return {
    //   id: null,
    //   card: null,
    //   ungraded: this.getGradePrice(null, results),
    //   psa_grade_1: this.getGradePrice('PSA 1 ', results),
    //   psa_grade_2: this.getGradePrice('PSA 2', results),
    //   psa_grade_3: this.getGradePrice('PSA 3', results),
    //   psa_grade_4: this.getGradePrice('PSA 4', results),
    //   psa_grade_5: this.getGradePrice('PSA 5', results),
    //   psa_grade_6: this.getGradePrice('PSA 6', results),
    //   psa_grade_7: this.getGradePrice('PSA 7', results),
    //   psa_grade_8: this.getGradePrice('PSA 8', results),
    //   psa_grade_9: this.getGradePrice('PSA 9', results),
    //   psa_grade_10: this.getGradePrice('PSA 10', results),
    //   other_grade_1: null,
    //   other_grade_2: null,
    //   other_grade_3: null,
    //   other_grade_4: null,
    //   other_grade_5: null,
    //   other_grade_6: null,
    //   other_grade_7: null,
    //   other_grade_8: null,
    //   other_grade_9: null,
    //   other_grade_10: null,
    // };
  }

  replaceSpecialSpaces(input: string): string {
    // This regex matches multiple space-like characters

    const regex = /[\u200B\u00A0\u2002\u2003\u2009\u200A\u202F\u205F\u3000]/g;
    console.log('replace: ' + input);
    console.log('result: ' + input.replace(regex, ' '));

    return input.replace(regex, ' ');
  }

  parsePrice(price: string): number | null {
    const cleaned = price.replace(/[^0-9.]/g, ''); // Remove non-numeric characters except '.'
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  getGradePrice(
    grade: string,
    results: {
      grade: string | null;
      price: string;
    }[],
  ): number | null {
    const price = results.find(
      (result) =>
        (grade === null && result.grade === null) ||
        (result.grade !== null && result.grade.startsWith(grade)),
    );
    console.log(
      'results ' + JSON.stringify(results.map((results) => results.grade)),
    );
    console.log('searching for ' + grade);
    console.log('found ' + JSON.stringify(price));
    if (price !== undefined) {
      return this.parsePrice(price.price);
    }
    return null;
  }

  async searchSales(
    playerName: string,
    cardNumber: string,
    year: string,
  ): Promise<
    {
      setName: string;
      cardNumber: string;
      playerName: string;
      grade: string | null;
      price: string;
    }[]
  > {
    // URL encode the search query to handle spaces and special characters
    const query = year + ' ' + playerName + ' ' + ' ' + cardNumber;
    return this.queryComc(query);
  }

  async queryComc(
    query: string,
    cookie: string | null = null,
  ): Promise<
    {
      setName: string;
      cardNumber: string;
      playerName: string;
      grade: string | null;
      price: string;
    }[]
  > {
    const encodedQuery = this.encodeSearch(query);
    const url = `https://www.comc.com/Cards,sd,vText,=${encodedQuery},ot`;

    console.log(url);

    try {
      // Fetch the HTML content of the page
      const headers = cookie
        ? {
            headers: {
              Cookie: cookie,
            },
          }
        : null;
      const response = await axios.get(url, headers);
      const html = response;
      // Use Cheerio to parse the HTML
      const $ = cheerio.load(html.data);

      const cardData: {
        setName: string;
        cardNumber: string;
        playerName: string;
        grade: string | null;
        price: string;
      }[] = [];

      // Select the first table inside #textView
      const table = $('#textView table').first();

      // Select all table rows after the header row
      table
        .find('tr')
        .slice(1)
        .each((_, row) => {
          const columns = $(row).find('td');

          if (columns.length > 0) {
            const setName = $(columns[0]).text().trim();
            const cardNumber = $(columns[1]).text().trim();
            const description = $(columns[2]).text().trim();
            const price = $(columns[4]).text().trim();

            // Extract playerName and grade from the description column
            const gradeMatch = description.match(/\[(.*?)\]/);
            const grade = gradeMatch
              ? this.replaceSpecialSpaces(gradeMatch[1])
              : null;
            const playerName = description.replace(/\[.*?\]/, '').trim();

            cardData.push({ setName, cardNumber, playerName, grade, price });
          }
        });

      return cardData;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw new Error('Unable to fetch or parse card data');
    }
  }

  encodeSearch(query: string): string {
    // Replace spaces with '+'
    return query
      .replace(/\[/g, '~5b') // Convert [ to ~5b
      .replace(/\]/g, '~5d') // Convert ] to ~5d
      .replace(/#/g, '~23') // Convert # to ~23
      .replace(/\s+/g, '+'); // Convert spaces to +
  }
}
