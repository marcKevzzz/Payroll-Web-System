import axios from "axios";
import { DTREntry } from "../types/types";

const API_URL = "http://localhost:5000/dtr"; // your backend URL

export const getDTR = async (): Promise<DTREntry[]> => {
  const res = await axios.get<DTREntry[]>(API_URL);
  return res.data;
};
export const addDTR = async (dtr: DTREntry) => {
  return axios.post(API_URL, dtr);
};

export const deleteDTRLogs = async (dtr_id: string) => {
  return axios.delete(`${API_URL}/${dtr_id}`);
};

// export const getEmployeeDTR = async (employee_id: string) => {
//   const res = await axios.get<DTREntry[]>(`${API_URL}/employee/${employee_id}`);
//   return res.data;
// };
