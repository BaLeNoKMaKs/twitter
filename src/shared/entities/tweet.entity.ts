import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, AfterInsert, JoinTable } from 'typeorm';
import { Tag } from './tag.entity';
import { TweetImage } from './tweetImage.entity';
import { User } from './user.entity';
import { Mention } from './mention.entity';
import { BadRequestException } from '@nestjs/common';
import * as nodemailer from "nodemailer"
import { SendNotificationsException } from '../exceptions/sendNotifications.exception';

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
      { eager: true },
  )
  images: TweetImage[];

  @OneToMany(
      () => Mention,
      mentions => mentions.tweet,
      { eager: true },
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
    if (this.mentions.length === 0) {
      return
    }  
    const emails = this.mentions.map(mention => {
        return mention.email
      })
    
      const transportConfig = {
        service: "Mail.ru",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
    };
    
      let transporter = nodemailer.createTransport(transportConfig);
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emails.join(","),
        subject: `Twitter notification`,
        html: `
        <div>
        <h1>Twitter notification</h1>
        <p>${this.user.username} mentioned you in his tweet</p>
        </div>   
        `,
      };

      await transporter.sendMail(mailOptions, (err) => {
        if (err) { 
          throw new SendNotificationsException();
        }
      });
  }
}