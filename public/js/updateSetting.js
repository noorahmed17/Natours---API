import axios from "axios";
import { showAlert } from "./alert";

export const updateSetting = async (data, type) => {
  try {
    const url =
      type === "password"
        ? "http://localhost:3000/api/users/updatePassword"
        : "http://localhost:3000/api/users/updateUser";
    const res = await axios({
      method: "patch",
      url,
      data,
    });
    console.log(res);
    if (res.data.status === "success") {
      showAlert("success", `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    console.log(err.response);
    showAlert("error", err.response.data.message);
  }
};
