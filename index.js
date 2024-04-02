import {
  getProductData,
  getCollectionsData,
  getAllData,
} from "./productsService.js";

export const handler = async (event) => {
  console.log("Handler invoked...");
  console.log(event);
  try {
    switch (event.httpMethod) {
      case "GET":
        if (event.path == "/products/{prodName}") {
          return await getProductData(event);
        } else if (event.path == "/products") {
          return await getAllData(event);
        } else if (event.path == "/collections/{collectionsName}") {
          return await getCollectionsData(event);
        }
        break;
      default:
        throw new Error("Invalid access");
    }
  } catch (e) {
    return e;
  }
};
