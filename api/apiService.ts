import { Poems } from "../entities/poems.response";

export class ApiService {
    BASE_URL = 'https://api.poetizer.com';
    deviceToken;

    constructor(deviceToken: string) {
        this.deviceToken = deviceToken;
    }

    getPoemsByTags(limit: number, offset : number, tags : string): Promise<Poems> {
        return fetch(`${this.BASE_URL}/poems/search?limit=${limit}&offset=${offset}`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Device-token ${this.deviceToken}`
            },
            body: tags
        })
            .then(res => res.json())
            .then((res: Poems) => {
                return res;
            });
    }
}
