import { ComcSalePrices } from 'src/comc/comc-sales-prices.entity';
import { EbaySearchResult } from 'src/ebay/ebay-search-result.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'issue' })
  issue: string;

  @Column({ name: 'card_number' })
  cardNumber: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'card_set', nullable: true })
  cardSet: string;

  @Column({ name: 'year' })
  year: number;

  @Column({ name: 'player_name', nullable: true })
  playerName: string;

  @Column({ name: 'scp_url', nullable: true })
  scpUrl: string;

  @Column({ name: 'epid', nullable: true })
  epid: string;

  @Column({ name: 'comc_set_name', nullable: true })
  comcSetName: string;

  @Column({ name: 'suspended' })
  suspended: boolean = false;

  @Column({ name: 'owned' })
  owned: boolean = false;

  @Column({ nullable: true, type: 'float' }) // Allow null
  ungraded: number | null = null;

  @Column({ nullable: true, type: 'float' })
  grade_1: number | null = null;

  @Column({ nullable: true, type: 'float' })
  grade_2: number | null = null;

  @Column({ nullable: true, type: 'float' })
  grade_3: number | null = null;

  @Column({ nullable: true, type: 'float' })
  grade_4: number | null = null;

  @Column({ nullable: true, type: 'float' })
  grade_5: number | null = null;

  @Column({ nullable: true, type: 'float' })
  grade_6: number | null = null;

  @Column({ nullable: true, type: 'float' })
  grade_7: number | null = null;

  @Column({ nullable: true, type: 'float' })
  grade_8: number | null = null;

  @Column({ nullable: true, type: 'float' })
  grade_9: number | null = null;

  @Column({ nullable: true, type: 'float' })
  grade_9_5: number | null = null;

  @Column({ nullable: true, type: 'float' })
  sgc_10: number | null = null;

  @Column({ nullable: true, type: 'float' })
  cgc_10: number | null = null;

  @Column({ nullable: true, type: 'float' })
  psa_10: number | null = null;

  @Column({ nullable: true, type: 'float' })
  bgs_10: number | null = null;

  @Column({ nullable: true, type: 'float' })
  bgs_10_black: number | null = null;

  @Column({ nullable: true, type: 'float' })
  cgc_10_pristine: number | null = null;

  @OneToOne(() => ComcSalePrices, (comcSalePrices) => comcSalePrices.card, {
    nullable: true,
  })
  comcSalePrices?: ComcSalePrices;

  @OneToMany(
    () => EbaySearchResult,
    (ebaySearchResult) => ebaySearchResult.card,
    {
      cascade: true, // Optional: Allows automatic updates on related entities
      eager: true, // Optional: Loads results automatically with the card
    },
  )
  ebaySearchResults?: EbaySearchResult[];
}
