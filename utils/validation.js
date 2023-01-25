import React from "react";
import { validate } from "validate.js";

export function validationString(id, value) {
  const validationResponse = validate(
    { [id]: value },
    { [id]: { presence: { allowEmpty: false } } }
  );
  return validationResponse && validationResponse[id];
}

export function validationEmail(id, value) {
  const constraint = {
    presence: { allowEmpty: false },
  };
  if (!!value) {
    constraint.email = true;
  }
  const validationResponse = validate({ [id]: value }, { [id]: constraint });
  return validationResponse && validationResponse[id];
}

export function validationPassword(id, value) {
  const constraint = {
    presence: { allowEmpty: false },
  };
  if (!!value) {
    constraint.length = {
      minimum: 6,
      message: "must be atleast 6 character long",
    };
  }
  const validationResponse = validate({ [id]: value }, { [id]: constraint });
  return validationResponse && validationResponse[id];
}
