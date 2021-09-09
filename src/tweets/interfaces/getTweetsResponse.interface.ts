import { Tweet } from "../../shared/entities/tweet.entity";
import { User } from "../../shared/entities/user.entity";

export interface GetTweetsResponse {
   user: User;
   tweet: Omit<Tweet, "user" | "sendEmail">;
}