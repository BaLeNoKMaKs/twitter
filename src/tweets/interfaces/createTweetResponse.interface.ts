import { Tweet } from "src/shared/entities/tweet.entity";
import { User } from "src/shared/entities/user.entity";

export interface CreateTweetResponse {
   user: Omit<User, "tweets" | "password">;
   tweet: Omit<Tweet, "user" | "sendEmail">;
   message: string;
}