import axios from "axios";
import { DataAPIClient } from "@datastax/astra-db-ts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import "dotenv/config";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  HF_API_KEY,
} = process.env;

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

const createCollection = async (similaritymetric: SimilarityMetric = "dot_product") => {
  const res = await db.createCollection(ASTRA_DB_COLLECTION, {
    vector: {
      dimension: 384, 
      metric: similaritymetric,
    },
  });
  console.log("Collection created:", res);
};

const f1Data = [
  "https://en.wikipedia.org/wiki/Formula_One",
  "https://racingnews365.com/f1-news",
  "https://www.autosport.com/f1/standings/2024/",
  "https://www.bbc.com/sport/formula1",
  "https://www.bbc.com/sport/formula1/calendar",
  "https://f1.fandom.com/wiki/Formula_1_Wiki",
  "https://www.formula1.com/en/latest/all",
  "https://en.wikipedia.org/wiki/2024_Formula_One_World_Championship",
  "https://en.wikipedia.org/wiki/2023_Formula_One_World_Championship",
  "https://en.wikipedia.org/wiki/2022_Formula_One_World_Championship",
  "https://en.wikipedia.org/wiki/2025_Formula_One_World_Championship",
  "https://en.wikipedia.org/wiki/List_of_Formula_One_Grands_Prix",
];

const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION);
  for await (const url of f1Data) {
    const content = await scrapePage(url);
    const chunks = await splitter.splitText(content);
    for await (const chunk of chunks) {
      const embedding = await getHuggingFaceEmbedding(chunk);

      const res = await collection.insertOne({
        $vector: embedding,
        text: chunk,
      });
      console.log("Inserted document:", res);
    }
  }
};

const scrapePage = async (url: string) => {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: true,
    },
    gotoOptions: {
      waitUntil: "domcontentloaded",
    },
    evaluate: async (page, browser) => {
      const result = await page.evaluate(() => document.body.innerHTML);
      await browser.close();
      return result;
    },
  });
  return (await loader.scrape())?.replace(/<[^>]*>?/gm, "");
};

const getHuggingFaceEmbedding = async (text: string) => {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
        },
      }
    );

    if (response.data.error) {
      throw new Error(`Hugging Face API Error: ${response.data.error}`);
    }

    return response.data; 
  } catch (error) {
    console.error("Error generating embedding from Hugging Face API:", error);
    throw error;
  }
};

createCollection().then(() => loadSampleData());
