import React from "react";

export const formReducer = (state, action) => {
  const { id, validationResult, inputValue } = action;
  const updatedValues = {
    ...state.inputValues,
    [id]: inputValue,
  };
  const updatedValidation = {
    ...state.inputValidities,
    [id]: validationResult,
  };
  let isFormValid = true;
  for (let key in updatedValidation) {
    if (updatedValidation[key] != undefined) {
      isFormValid = false;
      break;
    }
  }
  return {
    inputValues: updatedValues,
    inputValidities: updatedValidation,
    formValidity: isFormValid,
  };
};
