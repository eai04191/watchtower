import { post } from "./webhook";
import { Masto } from "masto";
import { parse } from "node-html-parser";

import * as dotenv from "dotenv";
dotenv.config();
(async () => {
    const debug = Boolean(process.env.debug) || false;

    const masto = await Masto.login({
        uri: process.env.MASTODON_URI || "",
        accessToken: process.env.MASTODON_ACCESS_TOKEN,
    });
    const bot = await masto.verifyCredentials();

    console.log(`I'am Watchtower of @${bot.acct}`);
    console.log(`${bot.url}`);

    console.log("Watching Timeline...");
    const stream = await masto.streamUser();

    stream.on("update", async (status) => {
        debug && console.log(status);

        const regex = /えあい/;
        const content = status.content;

        // 自身による言及は無視
        if (status.account.acct === bot.acct) return;
        //  reblogの場合は無視
        if (status.reblog) return;

        if (content.match(regex) || status.spoilerText.match(regex) || debug) {
            console.log(`${status.content} by ${status.account.acct}`);

            // 投稿自体ののurlがあればurlを投稿。なければuriを投稿
            status.url
                ? await post("💬 " + status.url)
                : await post("💬 " + status.uri);

            // contentに外部リンクが含まれていれば投稿
            const content = parse(status.content);
            const urls = content.querySelectorAll("a[target='_blank']");
            urls.forEach((url) => post("🔗 " + url.attributes.href));
        }
    });
})();
