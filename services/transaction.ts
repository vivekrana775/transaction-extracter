import { HOST_NAME } from "@/lib/constants";
import axios from "axios";

export const uploadPdfAndParseData = async (file: any) => {
  let formData = new FormData();
  formData.append("file", file);
  try {
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${HOST_NAME}/transaction/upload`,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    };

    const response = await axios.request(config);
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const getAllTransactions = (filters?: any) => {
  return new Promise<any>((resolve, reject) => {
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${HOST_NAME}/transaction?search=${filters?.searchBy || ""}&type=${
        filters?.type || ""
      }&page=${filters?.page || 1}&pageSize=${filters?.pageSize || 25}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios
      .request(config)
      .then((response) => {
        resolve(response?.data?.data);
      })
      .catch((error) => {
        console.log("error");
        reject(error);
      });
  });
};

export const deleteAllTransactions = (filters?: any) => {
  return new Promise<any>((resolve, reject) => {
    let config = {
      method: "delete",
      maxBodyLength: Infinity,
      url: `${HOST_NAME}/transaction`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    axios
      .request(config)
      .then((response) => {
        resolve(response?.data?.data);
      })
      .catch((error) => {
        console.log("error");
        reject(error);
      });
  });
};
