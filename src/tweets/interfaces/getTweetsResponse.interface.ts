import { Tweet } from "src/shared/entities/tweet.entity";
import { User } from "src/shared/entities/user.entity";

export interface GetTweetsResponse {
   user: User;
   tweet: Omit<Tweet, "user" | "sendEmail">;
}