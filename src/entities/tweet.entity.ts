import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, AfterInsert } from 'typeorm';
import { Tag } from './tag.entity';
import { TweetImage } from './tweetImage.entity';
import { User } from './user.entity';
import { Mention } from './mention.entity';
import { BadRequestException } from '@nestjs/common';
import * as nodemailer from "nodemailer"

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

  @OneToMany(
      () => Mention,
      mentions => mentions.tweet,
      { eager: true, onDelete: 'CASCADE' },
  )
  mentions: Mention[];

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
   
  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
           
          
  @AfterInsert()
  async sendEmail() {
      const emails = this.mentions.map(mention => {
        return mention.email
      })
  
      const transportConfig = {
        service: "Mail.ru",
        auth: {
          user: "max-dev-work@mail.ru",
          pass: "7364835root",
        },
    };
    
      let transporter = nodemailer.createTransport(transportConfig);
      console.log(emails)
      const mailOptions = {
        from: 'max-dev-work@mail.ru',
        to: emails.join(","),
        subject: `Twitter notification`,
        html: `
        <div>
        <h1>Twitter notification</h1>
        <p>${this.user.username} mentioned you in his tweet</p>
        </div>   
        `,
      };

      await transporter.sendMail(mailOptions, (err, info) => {
        if (err) { 
          throw new BadRequestException(err);
        }
        console.log(info)
      });
  }
}