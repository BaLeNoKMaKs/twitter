import { Tweet } from './tweet.entity';
import { BeforeInsert, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Mention {
     @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    email: string;
    
    @ManyToOne(
    () => Tweet,
        tweet => tweet.mentions,
    {onDelete: "CASCADE"}
    )
    tweet: Tweet;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;
}