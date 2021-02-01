import { post } from "./webhook";
import { Masto } from "masto";

import * as dotenv from "dotenv";
dotenv.config();
(async () => {
    const masto = await Masto.login({
        uri: process.env.MASTODON_URI || "",
        accessToken: process.env.MASTODON_ACCESS_TOKEN,
    });
    const bot = await masto.verifyCredentials();

    console.log(`I'am Watchtower of @${bot.acct}`);
    console.log(`${bot.url}`);

    console.log("Watching Timeline...");
    const stream = await masto.streamUser();

    stream.on("update", (status) => {
        const regex = /えあい/;
        const content = status.content;

        if (content.match(regex) || status.spoilerText.match(regex)) {
            if (status.account.acct === "Eai") return;

            console.log(`${status.content} by ${status.account.acct}`);
            post(status.uri);

            // contentにURLが含まれているか
            const urlRegex = /href="(http.+?)"/gm;
            const matched = content.match(urlRegex);
            if (matched) {
                const urls = Array.from(
                    content.matchAll(/href="(http.+?)"/g)
                ).map((u) => Array.isArray(u) && u[1]);
                post(urls.join("\n"));
            }
        }
    });
})();
