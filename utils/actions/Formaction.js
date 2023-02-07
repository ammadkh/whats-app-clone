import {
  validationString,
  validationEmail,
  validationPassword,
} from "../validation";

export const validateInput = (id, value) => {
  if (
    id === "firstName" ||
    id === "lastName" ||
    id === "about" ||
    id === "chatName"
  ) {
    return validationString(id, value);
  } else if (id === "email") {
    return validationEmail(id, value);
  } else if (id === "password") {
    return validationPassword(id, value);
  }
};
