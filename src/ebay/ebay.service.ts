import { Injectable, OnModuleInit } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const eBayAuthToken = require('ebay-oauth-nodejs-client');
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from 'src/cards/card.entity';
import { EbaySearchResult } from './ebay-search-result.entity';

@Injectable()
export class EbayService implements OnModuleInit {
  private ebayAuth: any;
  private accessToken: string | null = null;
  private ebayMarketPlaceId = 'EBAY_US';

  constructor(
    @InjectRepository(EbaySearchResult)
    private ebaySearchResultsRepository: Repository<EbaySearchResult>,
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
  ) {
    this.ebayAuth = new eBayAuthToken({
      clientId: process.env.EBAY_CLIENT_ID,
      clientSecret: process.env.EBAY_CLIENT_SECRET,
      env: 'PRODUCTION',
    });
  }

  async setDealHide(id: number, hide: number) {
    console.log('hiding deal: ' + id + ' ' + hide);
    const deal = await this.ebaySearchResultsRepository.findOne({
      where: { id: id },
    });
    deal.hide = hide;
    await this.ebaySearchResultsRepository.save(deal);
  }

  async updateDeals(
    cardId: number,
    ebaySearchResults: Partial<EbaySearchResult>[],
  ) {
    if (ebaySearchResults.length === 0) {
      return;
    }
    const card = await this.cardsRepository.findOne({
      where: { id: cardId },
    });
    if (!card) {
      throw new Error('card not found');
    }
    for (let x = 0; x < ebaySearchResults.length; x++) {
      const esr = ebaySearchResults[x];
      const existingDeal = card.ebaySearchResults!.find(
        (esrI) => esrI.itemId === esr.itemId,
      )!;
      if (
        existingDeal.price !== esr.price ||
        existingDeal.shippingCost !== esr.shippingCost
      ) {
        console.log('updating price of ' + esr.title);
        existingDeal.price = esr.price;
        existingDeal.shippingCost = esr.shippingCost;
        await this.ebaySearchResultsRepository.save(existingDeal);
      }
    }
  }

  async deleteDeals(cardId: number, ids: string[]) {
    const card = await this.cardsRepository.findOne({
      where: { id: cardId },
    });
    const dealsToDelete = card.ebaySearchResults?.filter((esr) =>
      ids.includes(esr.itemId),
    );
    await this.ebaySearchResultsRepository.remove(dealsToDelete);
  }

  // Function to create or update ComcSalePrices
  async create(
    ebaySearchResults: Partial<EbaySearchResult>[],
    cardId: number,
  ): Promise<any> {
    if (ebaySearchResults.length === 0) {
      return;
    }
    const card = await this.cardsRepository.findOne({
      where: { id: cardId },
    });
    if (!card) {
      throw new Error('card not found');
    }

    const entitiesToSave: EbaySearchResult[] = [];
    ebaySearchResults.forEach((esr) => {
      delete esr.id;
      entitiesToSave.push(
        this.ebaySearchResultsRepository.create({
          ...esr,
          card: { id: card.id },
        }),
      );
    });

    return this.ebaySearchResultsRepository.save(entitiesToSave);
  }

  async onModuleInit() {}

  async getAccessToken(): Promise<string> {
    try {
      const accessToken = await this.ebayAuth.getApplicationToken('PRODUCTION');
      const tokenObject = JSON.parse(accessToken);
      console.log(tokenObject.access_token);
      return tokenObject.access_token;
    } catch (error) {
      console.error('Error getting eBay access token:', error);
      throw new Error('Failed to retrieve eBay access token');
    }
  }
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async searchForCard(
    accessToken: string,
    epid: string,
    limit: number = 10,
    daysLeft: number | null = null,
    maxPrice: number | null = null,
  ): Promise<Partial<EbaySearchResult>[]> {
    const onlyGraded = true;
    const filterBuyingOptions = false;

    let url = `https://api.ebay.com/buy/browse/v1/item_summary/search?epid=${epid}&limit=${limit}`;

    const filters = [];

    if (onlyGraded) {
      filters.push('conditionIds:{2750}');
    }

    // If timeLeft is not null, sort by items ending soon
    if (filterBuyingOptions) {
      if (daysLeft !== null) {
        filters.push(`buyingOptions:{AUCTION}`);
      } else {
        filters.push(`buyingOptions:{FIXED_PRICE}`);
      }
    } else {
      filters.push(`buyingOptions:{AUCTION|FIXED_PRICE}`);
    }
    //sort=endingSoonest
    //{AUCTION|FIXED_PRICE}
    if (maxPrice !== null) {
      filters.push(`price:[..${maxPrice}],priceCurrency:USD`);
    }
    if (filters.length > 0) {
      url += '&filter=' + filters.join(',');
    }
    console.log('querying url: ' + url);

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': this.ebayMarketPlaceId,
        },
      });

      const items = response.data.itemSummaries || [];

      // Filter and return items where title contains PSA and grade
      const searchResults: Partial<EbaySearchResult>[] = [];

      items.forEach((item) => {
        const itemId = item.itemId;
        const title = item.title;
        const shippingCost =
          item.shippingOptions?.[0]?.shippingCost?.value || 'N/A';
        const ebayUrl = item.itemWebUrl;

        const psaGrade = this.extractPSAGradeFromTitle(item.title);
        const gradingSource = psaGrade ? 'PSA' : null;
        const grade = psaGrade;

        const listingTypes = item.buyingOptions;

        if (item.price?.value) {
          // this item has a buy it now
          const price = item.price.value;
          const auctionEndTime = null;
          searchResults.push({
            itemId,
            gradingSource,
            title,
            price,
            auctionEndTime,
            shippingCost,
            grade,
            ebayUrl,
            epid,
          });
        }

        if (item.currentBidPrice && listingTypes.includes('AUCTION')) {
          // this item has a auction
          const price = item.currentBidPrice.value;
          const auctionEndTime = item.itemEndDate; // Auction items have an `endTime`

          // Calculate today's date and add daysLeft to get the target date
          const targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + daysLeft); // Add daysLeft to today's date
          targetDate.setHours(23, 59, 59, 999);
          // Parse the auctionEndTime to a Date object
          const auctionEndDate = new Date(auctionEndTime);

          // Check if the auction end time is within the range of today + daysLeft
          if (auctionEndDate <= targetDate) {
            console.log('adding auction');
            searchResults.push({
              itemId,
              gradingSource,
              title,
              price,
              auctionEndTime,
              shippingCost,
              grade,
              ebayUrl,
              epid,
            });
          }
        }
      });

      return searchResults;
    } catch (e) {
      console.error('error getting ebay details: ' + epid, e);
      return [];
    }
  }

  async searchFootballCards(
    epids: string[],
    limit: number = 10, // Default limit is 10 if not specified
    daysLeft: number | null = null, // Filter for items ending in the next 4 hours (can be null)
    maxPrice: number | null = null,
  ): Promise<Partial<EbaySearchResult>[]> {
    const accessToken = await this.getAccessToken();

    // Perform search for each card and return the results in parallel

    const results: Partial<EbaySearchResult>[] = [];

    const batchSize: number = 20;
    const delayMs: number = 100;
    for (let i = 0; i < epids.length; i += batchSize) {
      const batch = epids.slice(i, i + batchSize);
      console.log(`Processing batch ${i / batchSize + 1}...`);

      const batchResults = await Promise.all(
        batch.map(async (epid) => {
          return this.searchForCard(
            accessToken,
            epid,
            limit,
            daysLeft,
            maxPrice,
          );
        }),
      );

      // Combine batch results into the final results array
      results.push(...batchResults.flat());

      if (i + batchSize < epids.length) {
        await this.sleep(delayMs);
      }
    }

    return results.flat();
  }

  private extractPSAGradeFromTitle(title: string): string | null {
    const psaPattern = /PSA (\d+)/i; // Match PSA followed by a number
    const match = title.match(psaPattern);

    return match ? match[1] : null; // Return the grade if found, otherwise null
  }
}
