import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Tag } from './tag.entity';
import { TweetImage } from './tweetImage.entity';
import { User } from './user.entity';

@Entity()
export class Tweet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @ManyToOne(() => User, (user: User) => user.tweets)
  user: User;

  @OneToMany(
      () => TweetImage,
      images => images.tweet,
      { eager: true, onDelete: 'CASCADE' },
  )
  images: TweetImage[];

  @ManyToMany(
    () => Tag,
    tag => tag.tweets,
    { eager: true },
  )
  tags: Tag[];
  
  @ManyToOne(
    () => Tweet,
    tweet => tweet.comments,
    { onDelete: 'CASCADE' },
  )
  mainTweet: Tweet;

  @OneToMany(
      () => Tweet,
      comments => comments.mainTweet,
  )
  comments: Tweet[];

  @Column('text', { nullable: true })
    gif: string;
   
  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}