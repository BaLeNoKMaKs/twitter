import {
    Entity,
    Column,
    ManyToMany,
    JoinTable,
    BaseEntity,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Tweet } from './tweet.entity';

@Entity()
export class Tag extends BaseEntity {
   @PrimaryGeneratedColumn()
   id: number;

   @Column('text', { unique: true })
   text: string;

   @ManyToMany(
      () => Tweet,
      tweet => tweet.tags,
   )
      
    @JoinTable()
    tweets?: Tweet[];
}