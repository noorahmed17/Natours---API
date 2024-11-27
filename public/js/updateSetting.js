import axios from "axios";
import { showAlert } from "./alert";

export const updateSetting = async (data, type) => {
  try {
    const url =
      type === "password"
        ? "/api/users/updatePassword"
        : "/api/users/updateUser";
    const res = await axios({
      method: "patch",
      url,
      data,
    });
    if (res.data.status === "success") {
      showAlert("success", `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    console.log(err.response);
    showAlert("error", err.response.data.message);
  }
};
