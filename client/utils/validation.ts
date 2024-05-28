export const validateNameInput = (
  input: HTMLInputElement,
  errorContainer: HTMLElement
) => {
  if (input.value === "") {
    input.classList.add("error-empty");
    input.classList.remove("error-invalid");

    errorContainer.classList.add("empty");
    errorContainer.classList.remove("invalid");
    return false;
  } else if (input.value !== "" && input.value.match(/^[a-zA-Z_]+$/) === null) {
    input.classList.remove("error-empty");
    input.classList.add("error-invalid");

    errorContainer.classList.remove("empty");
    errorContainer.classList.add("invalid");
    return false;
  } else {
    input.classList.remove("error-empty");
    input.classList.remove("error-invalid");
    errorContainer.classList.remove("empty");
    errorContainer.classList.remove("invalid");
    return true;
  }
};

export const validatePasswordInput = (
  input: HTMLInputElement,
  errorContainer: HTMLElement
) => {
  if (input.value === "") {
    input.classList.add("error-empty");
    input.classList.remove("error-invalid");

    errorContainer.classList.add("empty");
    errorContainer.classList.remove("invalid");
    return false;
  } else if (
    input.value !== "" &&
    input.value.match(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_!])[a-zA-Z\d_!]{8,}$/
    ) === null
  ) {
    input.classList.remove("error-empty");
    input.classList.add("error-invalid");

    errorContainer.classList.remove("empty");
    errorContainer.classList.add("invalid");
    return false;
  } else {
    input.classList.remove("error-empty");
    input.classList.remove("error-invalid");
    errorContainer.classList.remove("empty");
    errorContainer.classList.remove("invalid");
    return true;
  }
};

export const validateAnswerAndWordInput = (
  input: HTMLInputElement,
  errorContainer: HTMLElement
) => {
  // wordInput
  if (input.value === "") {
    input.classList.add("error-empty");
    input.classList.remove("error-invalid");

    errorContainer.classList.add("empty");
    errorContainer.classList.remove("invalid");
    return false;
  } else if (
    input.value !== "" &&
    input.value.match(/^(?=.*[a-z])[a-z]{2,100}$/) === null
  ) {
    input.classList.remove("error-empty");
    input.classList.add("error-invalid");

    errorContainer.classList.remove("empty");
    errorContainer.classList.add("invalid");
    return false;
  } else {
    input.classList.remove("error-empty");
    input.classList.remove("error-invalid");
    errorContainer.classList.remove("empty");
    errorContainer.classList.remove("invalid");
    return true;
  }
};

export const validateHintInput = (
  input: HTMLInputElement,
  errorContainer: HTMLElement
) => {
  // hintInput
  if (input.value === "") {
    input.classList.add("error-empty");
    input.classList.remove("error-invalid");

    errorContainer.classList.add("empty");
    errorContainer.classList.remove("invalid");
    return false;
  } else {
    input.classList.remove("error-empty");
    input.classList.remove("error-invalid");
    errorContainer.classList.remove("empty");
    errorContainer.classList.remove("invalid");
    return true;
  }
};
