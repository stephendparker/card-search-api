import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './card.entity';
import { SCPService } from 'src/scp/scp.service';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
    private readonly scpService: SCPService,
  ) {}

  findAll(): Promise<Card[]> {
    return this.cardsRepository.find({
      relations: ['comcSalePrices', 'ebaySearchResults'],
    });
  }

  createCard(issue: string, cardNumber: string, year: number): Promise<Card> {
    const user = this.cardsRepository.create({ issue, cardNumber, year });
    return this.cardsRepository.save(user);
  }

  createCards(
    cardsData: { issue: string; cardNumber: string; year: number }[],
  ): Promise<Card[]> {
    const cards = this.cardsRepository.create(cardsData);
    return this.cardsRepository.save(cards);
  }

  findByIssue(issue: string): Promise<Card> {
    return this.cardsRepository.findOne({
      where: { issue: issue },
      relations: ['comcSalePrices', 'ebaySearchResults'],
    });
  }

  async update(card: Card): Promise<Card> {
    await this.cardsRepository.save(card);
    return card;
  }

  async updateByIssue(udpate: Partial<Card>): Promise<Card> {
    const existingCard = await this.findByIssue(udpate.issue);

    const card = { ...existingCard, ...udpate };
    await this.update(card);

    if (existingCard.scpUrl !== udpate.scpUrl) {
      return this.refreshSpcCardData(udpate.issue);
    }

    return existingCard;
  }

  async refreshSpcCardData(issue: string): Promise<Card> {
    const card = await this.findByIssue(issue);
    console.log('refreshScpData found card: ' + JSON.stringify(card));

    const cardDetails = !card.scpUrl
      ? {}
      : await this.scpService.loadCardDetails(card.scpUrl);

    console.log('cardDetails: ' + JSON.stringify(cardDetails));

    const updatedCard = {
      issue,
      ...card,
      ...cardDetails,
    };

    console.log('updatedCard: ' + JSON.stringify(updatedCard));

    return this.updateByIssue(updatedCard);
  }
}
