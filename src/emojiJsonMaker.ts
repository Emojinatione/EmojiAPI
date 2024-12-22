import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { EmojiMeta, EmojiCollection } from "./types"

const EMOJI_VERSION: string = 'latest'; //'16.0';

interface EmojiArrCollections {
    comments: string;
    minimal: EmojiMeta[];
    full: EmojiMeta[]
}

interface EmojiTreeCollections {
    comments: string;
    minimal: EmojiCollection;
    full: EmojiCollection;
}

makeEmojiList(EMOJI_VERSION);

export async function makeEmojiList(ver: string) {
    try {
        const text: string = await getTestFilePromise(ver);

        const collected1: EmojiTreeCollections = getCollectionTreeAsJSON(text);
        console.log(`Format text to json...`)
        console.log(`Processed emojis: ${collected1.full.length}`)
        console.log(`Write file: emoji-fullTree${ver}.json, emoji-minimalTree${ver}.json\n`)
        await writeFiles({ minimal: collected1.minimal, full: collected1.full, ver, name: "Tree" })

        const collected2: EmojiArrCollections = getCollectionArr(text);
        console.log(`Format text to json...`)
        console.log(`Processed emojis: ${collected2.full.length}`)
        await writeFiles({ minimal: collected2.minimal, full: collected2.full, ver, name: "Arr" })
        console.log(`Write file: emoji-fullAttr${ver}.json, emoji-minimalAttr${ver}.json\n`)

        console.log(collected2.comments)

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

async function getTestFilePromise(ver: string): Promise<string> {
    const url: string = `https://unicode.org/Public/emoji/${ver}/emoji-test.txt`;

    process.stdout.write(`Fetch emoji-test.txt (v ${EMOJI_VERSION})`);
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            let text: string = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                process.stdout.write('.');
                text += chunk;
            });
            res.on('end', () => {
                process.stdout.write('\n');
                resolve(text);
            });
            res.on('error', reject);
        });
    });
}

async function getTestFileTryCatch(ver: string): Promise<string> {
    const emojiTextUrl: string = `https://unicode.org/Public/emoji/${ver}/emoji-test.txt`;

    process.stdout.write(`Fetching emoji-test.txt (v${ver})...`);

    try {
        const response = await fetch(emojiTextUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch emoji-test.txt (status: ${response.status})`);
        }
        const text: string = await response.text();
        process.stdout.write(` Downloaded!\n`);
        return text;
    } catch (error) {
        const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error fetching emoji-test.txt: ${errorMessage}`);
        throw error; // Re-throw the error for further handling
    }
}

function getCollectionTreeAsJSON(text: string): EmojiTreeCollections {
    const { comments, full, minimal } = text.trim().split('\n').reduce((accu: EmojiTreeCollections, line) => {
        let group: string = '';
        let subgroup: string = '';
        if (line.startsWith('# group: ')) {
            console.log(`Processing group: ${line.slice(9).trim()}...`);
            group = line.slice(9).trim();
        } else if (line.startsWith('# subgroup: ')) {
            console.log(`Processing subgroup: ${line.slice(12).trim()}...`);
            subgroup = line.slice(12).trim();
        } else if (line.startsWith('#')) {
            accu.comments += line + '\n';
        } else {
            const meta = parseLine(line); // Assume parseLine is defined elsewhere
            if (meta) {
                meta.category = `${group} (${subgroup})`;

                if (meta.status === 'fully-qualified' || meta.status === 'component') {
                    accu.minimal[group] = accu.minimal[group] || {};
                    accu.minimal[group][subgroup] = accu.minimal[group][subgroup] || [];
                    accu.minimal[group][subgroup].push({
                        ...meta,
                        group: undefined,
                        subgroup: undefined,
                    });
                }

                accu.full[group] = accu.full[group] || {};
                accu.full[group][subgroup] = accu.full[group][subgroup] || [];
                accu.full[group][subgroup].push(meta);
            } else {
                accu.comments = accu.comments.trim() + '\n\n';
            }
        }
        return accu;
    },
        {
            comments: '',
            minimal: {} as EmojiCollection,
            full: {} as EmojiCollection,
        }
    );

    return { comments: comments.trim(), minimal: minimal, full: full };
}

function getCollectionArr(text: string): EmojiArrCollections {
    const collected = text.trim().split('\n').reduce((accu: EmojiArrCollections, line) => {
        let group: string = '';
        let subgroup: string = ''
        if (line.startsWith('# group: ')) {
            console.log(`  Processing ${line.substr(2)}...`)
            group = line.substr(9)
        } else if (line.startsWith('# subgroup: ')) {
            console.log(`  Processing ${line.substr(2)}...`)
            subgroup = line.substr(12)
        } else if (line.startsWith('#')) {
            accu.comments = accu.comments + line + '\n'
        } else {
            var meta: EmojiMeta | null = parseLine(line)
            if (meta) {
                meta.category = `${group} (${subgroup})`
                meta.group = group
                meta.subgroup = subgroup
                if (meta.status === "fully-qualified" || meta.status === "component") {
                    accu.minimal.push(meta)
                    // accu.compact.push(meta.char)
                }
                accu.full.push(meta);
            } else {
                accu.comments = accu.comments.trim() + '\n\n'
            }
        }
        return accu;
    }, { comments: '', minimal: [], full: [] })
    return collected;
}


function parseLine(line: string): any | null {
    const data: string[] = line.trim().split(/\s+[;#] /);

    if (data.length !== 3) {
        return null;
    }

    const [codes, status, charAndName]: string[] = data;
    const [, char, version, name]: any = charAndName.match(/^(\S+) (E\d+\.\d+) (.+)$/);
    const emojiVersion: string = version.slice(1);

    return { codes, status, emojiVersion, char, name };
}

function writeFiles({ minimal, full, ver, name, }:
    { minimal: EmojiMeta[] | EmojiCollection, full: EmojiMeta[] | EmojiCollection, ver: string, name: string; }): void {
    const rel = (...args: string[]): string => path.resolve(__dirname, ...args);
    fs.writeFileSync(
        rel(`./json/${name}/emoji-full${name}${ver}.json`),
        JSON.stringify(full, null, 2),
        'utf8'
    );

    fs.writeFileSync(
        rel(`./json/${name}/emoji-minimal${name}${ver}.json`),
        JSON.stringify(minimal, null, 2),
        'utf8'
    );

}
