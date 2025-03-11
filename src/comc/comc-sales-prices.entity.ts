import { Card } from 'src/cards/card.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('comc_sale_prices')
export class ComcSalePrices {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Card, (card) => card.comcSalePrices)
  @JoinColumn({ name: 'card_id' }) // Foreign key column in the ComcSalePrices table
  card: Card;

  @Column({ nullable: true, type: 'float' })
  ungraded: number | null = null;

  @Column({ nullable: true, type: 'float' })
  psa_grade_1: number | null = null;

  @Column({ nullable: true, type: 'float' })
  psa_grade_2: number | null = null;

  @Column({ nullable: true, type: 'float' })
  psa_grade_3: number | null = null;

  @Column({ nullable: true, type: 'float' })
  psa_grade_4: number | null = null;

  @Column({ nullable: true, type: 'float' })
  psa_grade_5: number | null = null;

  @Column({ nullable: true, type: 'float' })
  psa_grade_6: number | null = null;

  @Column({ nullable: true, type: 'float' })
  psa_grade_7: number | null = null;

  @Column({ nullable: true, type: 'float' })
  psa_grade_8: number | null = null;

  @Column({ nullable: true, type: 'float' })
  psa_grade_9: number | null = null;

  @Column({ nullable: true, type: 'float' })
  psa_grade_10: number | null = null;

  @Column({ nullable: true, type: 'float' })
  other_grade_1: number | null = null;

  @Column({ nullable: true, type: 'float' })
  other_grade_2: number | null = null;

  @Column({ nullable: true, type: 'float' })
  other_grade_3: number | null = null;

  @Column({ nullable: true, type: 'float' })
  other_grade_4: number | null = null;

  @Column({ nullable: true, type: 'float' })
  other_grade_5: number | null = null;

  @Column({ nullable: true, type: 'float' })
  other_grade_6: number | null = null;

  @Column({ nullable: true, type: 'float' })
  other_grade_7: number | null = null;

  @Column({ nullable: true, type: 'float' })
  other_grade_8: number | null = null;

  @Column({ nullable: true, type: 'float' })
  other_grade_9: number | null = null;

  @Column({ nullable: true, type: 'float' })
  other_grade_10: number | null = null;
}
