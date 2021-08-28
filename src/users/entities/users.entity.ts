import { Comment } from 'src/comments/entities/comments.entity';
import { Tweet } from 'src/tweets/entities/tweets.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  username: string;

  @Column({
    unique: true
  })
  email: string;

  @Column({ length: 60 })
   password: string;
   
   @OneToMany(() => Tweet, (tweet: Tweet) => tweet.user, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
   tweets: Tweet[];

   @OneToMany(() => Comment, (comment: Comment) => comment.user, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
   comments: Comment[];
   
   @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}