import got from "got";

export const post = async (content: string) => {
    const url = process.env.WEBHOOK_URL;
    if (!url) throw new Error("env WEBHOOK is not set");
    const { body } = await got.post(url, {
        json: {
            content: content,
            avatar_url:
                "https://img.icons8.com/fluent/512/000000/lighthouse.png",
            username: "Watchtower",
        },
        responseType: "json",
    });
    console.log(body);
};
