import { User } from "./user.entity";

export class Poem {

    id: number;
    title: string;
    text: string;
    text_align: string;
    publish_date: Date;
    author: User;
    like_count: number;
    comment_count: number;
    me_liked: boolean;
    me_bookmarked: boolean;
    tags: string[];
}