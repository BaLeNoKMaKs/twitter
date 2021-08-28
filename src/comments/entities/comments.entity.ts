import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Tweet } from 'src/tweets/entities/tweets.entity';
import { User } from 'src/users/entities/users.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  imageUrl: string;

  @ManyToOne(() => Tweet, (tweet: Tweet) => tweet.comments)
  tweet: User;

  @ManyToOne(() => User, (user: User) => user.comments)
  user: User;
   
  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}