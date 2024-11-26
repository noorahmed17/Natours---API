import axios from "axios";
import { showAlert } from "./alert";
import { loadStripe } from "@stripe/stripe-js";

let stripe;
const initStripe = async () => {
  stripe = await loadStripe(
    "pk_test_51QK0rJG7qSt2zu24gr6WlLQoTBHb1hwDr9nKslk63VwJ7YILqupRaRxWXEyB4cuticbZclHUYOqw10llDxJa6egq00w9Lzaq3Q"
  );
};
initStripe();

export const bookTour = async (tourId) => {
  try {
    const session = await axios(
      `http://localhost:3000/api/booking/checkout-session/${tourId}`
    );

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);
  }
};
