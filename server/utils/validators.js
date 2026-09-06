export const isValidEmail = (email = "") => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPassword = (password = "") => {
  return password.length >= 6;
};

export const isValidName = (name = "") => {
  return name.trim().length >= 2;
};