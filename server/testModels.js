import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  try {
    const res = await axios.get("https://api.groq.com/openai/v1/models", {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
    });

    console.log("AVAILABLE MODELS:");
    console.log(res.data);
  } catch (err) {
    console.log(err.response?.data || err.message);
  }
};

run();