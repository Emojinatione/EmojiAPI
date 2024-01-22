import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

interface EmojiMeta {
    codes: string;
    status: string;
    emojiVersion: string;
    char: string;
    name: string;
    category: string;
    group: string;
    subgroup: string;
}

interface EmojiCollection {
    comments: string;
    full: EmojiMeta[];
    compact: string[];
}

const EMOJI_VERSION: string = 'latest'; //'15.1';

async function main() {
    const text: string = await getTestFile(EMOJI_VERSION);
    const collected: EmojiCollection = getCollection(text);
    console.log(`Format text to json...`);

    console.log(`Processed emojis: ${collected.full.length}`);

    console.log('Write file: emoji.json, emoji-compact.json \n');
    await writeFiles(collected);

    console.log(collected.comments);
}

async function getTestFile(ver: string): Promise<string> {
    const url: string = `https://unicode.org/Public/emoji/${ver}/emoji-test.txt`;

    process.stdout.write(`Fetch emoji-test.txt (v${EMOJI_VERSION})`);
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

function getCollection(text: string): EmojiCollection {
    const collected: EmojiCollection = text.trim().split('\n').reduce((accu, line) => {
        if (line.startsWith('# group: ')) {
            console.log(`  Processing ${line.substr(2)}...`);
            accu.group = line.substr(9);
        } else if (line.startsWith('# subgroup: ')) {
            accu.subgroup = line.substr(12);
        } else if (line.startsWith('#')) {
            accu.comments = accu.comments + line + '\n';
        } else {
            const meta: EmojiMeta | null = parseLine(line);
            if (meta && (meta.status === 'fully-qualified' || meta.status === 'component')) {
                meta.category = `${accu.group} (${accu.subgroup})`;
                meta.group = accu.group;
                meta.subgroup = accu.subgroup;
                accu.full.push(meta);
                accu.compact.push(meta.char);
            } else {
                accu.comments = accu.comments.trim() + '\n\n';
            }
        }
        return accu;
    }, { comments: '', full: [], compact: [] });
    return collected;
}

function parseLine(line: string): EmojiMeta | null {
    const data: string[] = line.trim().split(/\s+[;#] /);

    if (data.length !== 3) {
        console.log(data);
        return null;
    }

    const [codes, status, charAndName]: string[] = data;
    const [, char, version, name]: RegExpMatchArray | null = charAndName.match(/^(\S+) (E\d+\.\d+) (.+)$/);
    const emojiVersion: string = version.slice(1);

    return { codes, status, emojiVersion, char, name };
}

function writeFiles({ full, compact }: EmojiCollection): void {
    const rel = (...args: string[]) => path.resolve(__dirname, ...args);

    fs.writeFileSync(rel('emoji.json'), JSON.stringify(full), 'utf8');
    fs.writeFileSync(rel('emoji-compact.json'), JSON.stringify(compact), 'utf8');
}

main();
