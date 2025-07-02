export default async function handler(req, res) {
  const { input, type } = req.body;
  const token = process.env.HF_TOKEN; // <- token stays hidden in Vercel

  const model = type === "image"
    ? "stabilityai/stable-diffusion-2"
    : "HuggingFaceH4/zephyr-7b-beta";

  const hfRes = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(type === "image" ? { inputs: input } : {
      inputs: {
        past_user_inputs: [],
        generated_responses: [],
        text: input
      }
    })
  });

  if (type === "image") {
    const buffer = await hfRes.arrayBuffer();
    res.setHeader("Content-Type", "image/png");
    res.send(Buffer.from(buffer));
  } else {
    const data = await hfRes.json();
    res.status(200).json({ output: data.generated_text || "No response" });
  }
}
