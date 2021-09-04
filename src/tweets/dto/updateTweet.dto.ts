export class UpdateTweetDto {
   text: string;
   tags?: string[];
    mentions?: string[];
    deleteImages?: boolean
}