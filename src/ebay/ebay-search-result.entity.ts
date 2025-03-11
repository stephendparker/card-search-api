import { Card } from 'src/cards/card.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity('ebay_search_results')
export class EbaySearchResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Card, (card) => card.ebaySearchResults, {
    onDelete: 'CASCADE', // Delete search results if the card is deleted
  })
  @JoinColumn({ name: 'card_id' })
  card: Card;

  @Column({ name: 'itemId' })
  itemId: string;

  @Column({ name: 'grade', nullable: true })
  grade: string | null = null;

  @Column({ name: 'gradingSource', nullable: true })
  gradingSource: string | null = null;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'price' })
  price: string;

  @Column({ name: 'shippingCost' })
  shippingCost: string;

  @Column({ name: 'ebayUrl', type: 'varchar', length: 2000 })
  ebayUrl: string;

  @Column({ name: 'epid' })
  epid: string;

  @Column({ name: 'hide', default: false })
  hide: number;

  @Column({ name: 'auctionEndTime', nullable: true })
  auctionEndTime: string | null;
}
