import { User } from 'src/users/entities/users.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Comment } from './../../comments/entities/comments.entity';

@Entity()
export class Tweet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  imageUrl: string;

  @ManyToOne(() => User, (user: User) => user.tweets)
  user: User;

  @OneToMany(() => Comment, (comment: Comment) => comment.tweet, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  comments: Comment[];
   
  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}