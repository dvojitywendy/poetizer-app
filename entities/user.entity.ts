
export class User {

    id: number;
    name: string;
    following_count: number;
    followers_count: number;
    picture: URL;
    bio: string;
    me_following: boolean;
    follows_me: boolean;
}