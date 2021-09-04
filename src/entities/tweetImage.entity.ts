import { Tweet } from './tweet.entity';
import { AbstractImageEntity } from './abstractImage.entity';
import { Entity, ManyToOne } from 'typeorm';

@Entity()
export class TweetImage extends AbstractImageEntity {
    @ManyToOne(
        () => Tweet,
        tweet => tweet.images, {onDelete: "CASCADE"}
    )
    tweet: Tweet;
}