import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

let res = {
  headers: {},
  statusCode: 0,
  body: {},
};

export const getProductData = async (event) => {
  console.log("getProductData invoked...");
  console.log(event);

  if (!event || !event.prodName) {
    console.log("Failed to find event or event.prodName");
    res.statusCode = 400;
    res.body = JSON.stringify({ message: "Invalid Access" });
    return res;
  }

  // Gets product data from the product table
  try {
    const prodName = event.prodName;
    const prodCommand = new GetCommand({
      TableName: process.env.DYNAMODB_TABLE_PRODUCTS,
      Key: {
        prodName: prodName,
      },
    });

    const prodResponse = await docClient.send(prodCommand);

    // Gets review data based on product info
    const prodInfo = prodResponse.Item;
    const reviewCommand = new GetCommand({
      TableName: process.env.DYNAMODB_TABLE_REVIEWS,
      Key: {
        item:
          prodInfo.brand.toLowerCase().split(" ").join("-") +
          "-" +
          prodInfo.model.toLowerCase().split(" ").join("-"),
      },
    });

    const reviewResponse = await docClient.send(reviewCommand);

    res.statusCode = 200;
    res.body = JSON.stringify({ ...prodResponse.Item, ...reviewResponse.Item });
  } catch (e) {
    console.log(e);
    res.statusCode = 500;
    res.body = JSON.stringify({ message: "Server Error" });
  }
  return res;
};

export const getCollectionsData = async (event) => {
  console.log("GetCollections Invoked...");
  console.log(event);
  if (!event || !event.collectionsName) {
    console.log("Failed to find event or event.collectionsName");
    res.statusCode = 400;
    res.body = JSON.stringify({ message: "Invalid Access" });
    return res;
  }

  const collections = event.collectionsName;

  try {
    const command = new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE_PRODUCTS,
      FilterExpression: "contains(#categoryAlias, :categoryValue)",
      ExpressionAttributeNames: {
        "#categoryAlias": "category",
      },
      ExpressionAttributeValues: {
        ":categoryValue": collections,
      },
    });

    const response = await docClient.send(command);

    const productInfo = response.Items;
    let reviewItem = {};
    for (let i = 0; i < response.Count; i++) {
      const key =
        productInfo[i].brand.toLowerCase().split(" ").join("-") +
        "-" +
        productInfo[i].model.toLowerCase().split(" ").join("-");
      if (!reviewItem.hasOwnProperty(key)) {
        const getReviewCommand = new GetCommand({
          TableName: process.env.DYNAMODB_TABLE_REVIEWS,
          Key: {
            item: key,
          },
        });
        const getReviewResponse = await docClient.send(getReviewCommand);

        reviewItem[key] = getReviewResponse.Item;
      }
      productInfo[i] = { ...productInfo[i], ...reviewItem[key] };
    }

    res.statusCode = 200;
    res.body = JSON.stringify({
      products: productInfo,
      count: response.Count,
    });
  } catch (e) {
    console.log(e);
    res.statusCode = 500;
    res.body = JSON.stringify({ message: "Server Error" });
  } finally {
    return res;
  }
};

export const getAllData = async (event) => {
  console.log("getAllData Invoked...");
  console.log(event);
  if (!event) {
    console.log("Failed to find event or event.collectionsName");
    res.statusCode = 400;
    res.body = JSON.stringify({ message: "Invalid Access" });
    return res;
  }

  try {
    const command = new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE_PRODUCTS,
    });

    const response = await docClient.send(command);

    const productInfo = response.Items;
    let reviewItem = {};
    for (let i = 0; i < response.Count; i++) {
      const key =
        productInfo[i].brand.toLowerCase().split(" ").join("-") +
        "-" +
        productInfo[i].model.toLowerCase().split(" ").join("-");
      if (!reviewItem.hasOwnProperty(key)) {
        const getReviewCommand = new GetCommand({
          TableName: process.env.DYNAMODB_TABLE_REVIEWS,
          Key: {
            item: key,
          },
        });
        const getReviewResponse = await docClient.send(getReviewCommand);
        reviewItem[key] = getReviewResponse.Item;
      }
      productInfo[i] = { ...productInfo[i], ...reviewItem[key] };
    }

    res.statusCode = 200;
    res.body = JSON.stringify({
      products: productInfo,
      count: response.Count,
    });
  } catch (e) {
    console.log(e);
    res.statusCode = 500;
    res.body = JSON.stringify({ message: "Server Error" });
  } finally {
    return res;
  }
};
