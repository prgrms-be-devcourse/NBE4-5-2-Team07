import createClient from "openapi-fetch";
import { paths } from "./apiV1/schema";

const client = createClient<paths>({
  baseUrl: "https://devapi.store",
  headers: {
    "Content-Type": "application/json",
  },
});

export default client;
