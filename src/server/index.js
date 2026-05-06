import ImageKit from "imagekit";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config({ path: "../../.env" });

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());


const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});



app.get("/imagekit-auth", (req, res) => {
  const authParams = imagekit.getAuthenticationParameters();
  res.send(authParams);
});

app.listen(port, () => {
  console.log(`Auth server running on port ${port}`);
});