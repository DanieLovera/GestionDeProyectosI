import { apiGet } from "./client.js";

const getDepartments = async () => {
  return await apiGet("/units");
};

export { getDepartments };