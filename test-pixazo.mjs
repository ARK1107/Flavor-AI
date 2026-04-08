import 'dotenv/config';

async function tryEndpoint(url, payload) {
    console.log("Trying:", url);
    try {
        const apiKey = "d6e6b06eee6c496b9dc6c83ad8b76a97";
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": apiKey,
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });
        const text = await res.text();
        console.log(`Status ${res.status}:`, text.slice(0, 200));
    } catch(e) {
        console.error("Error:", e.message);
    }
}

async function run() {
    const p1 = { prompt: "Coffee", image_size: "landscape_16_9", num_images: 1 };
    const p2 = { prompt: "Coffee", n: 1, size: "1024x1024" };

    await tryEndpoint("https://gateway.pixazo.ai/recraft/v4-pro/generate", p1);
    const p3 = { prompt: "Coffee", response_format: "url" };
    await tryEndpoint("https://gateway.pixazo.ai/dalle3/v1/images/generations", p3);
}

run();
