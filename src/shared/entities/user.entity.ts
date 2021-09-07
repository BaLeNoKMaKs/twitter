import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Avatar } from './avatar.entity';
import { Tweet } from './tweet.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({
    unique: true
  })
  username: string;

  @Column({
    unique: true
  })
  email: string;

  @Column('text')
   password: string;
   
  @OneToMany(() => Tweet, (tweet: Tweet) => tweet.user, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  })
  tweets: Tweet[];

  @JoinColumn()
  @OneToOne(() => Avatar, {
      eager: true,
      nullable: true,
  })
  avatar?: Avatar;
   
   @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}