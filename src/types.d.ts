export interface EmojiMetaReduced {
    category: string;
    codes: string;
    status: string;
    emojiVersion: string;
    char: string;
    name: string;
}

export interface EmojiMeta extends EmojiMetaReduced {
    group: string;
    subgroup: string;
}


export type EmojiMetaColArrayReduced = EmojiMetaReduced[];
export type EmojiMetaColArray = EmojiMeta[];

// export interface EmojiCollectionReduced {
//     [group: string]: {
//         [subgroup: string]: EmojiMetaReduced[];
//     }[];
// }

export interface EmojiCollection {
    [group: string]: {
        [subgroup: string]: EmojiMetaReduced[];
    };
}
