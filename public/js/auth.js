import axios from "axios";
import { showAlert } from "./alert";

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: "post",
      url: "/api/users/signin",
      data: {
        email,
        password,
      },
    });
    if (res.data.status === "success") {
      showAlert("success", "Logged in successfully!");
      window.setTimeout(() => {
        window.location.assign("/");
      }, 1500);
    }
  } catch (err) {
    console.log(err.response);
    showAlert("error", err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: "get",
      url: "/api/users/logout",
    });
    if (res.data.status === "success") window.location.href = "/";
  } catch (err) {
    console.log(err.response);
    showAlert("error", "Error logging out! Try again.");
  }
};

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: "post",
      url: "/api/users/signup",
      data: { name, email, password, passwordConfirm },
    });
    if (res.data.status === "success") {
      showAlert("success", "Signed Up successfully!");
      window.setTimeout(() => {
        window.location.assign("/");
      }, 1500);
    }
  } catch (err) {
    console.log(err.response);
    showAlert("error", "Error Signing Up! Try again.");
  }
};
