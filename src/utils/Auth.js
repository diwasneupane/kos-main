export function isAuthenticated() {
  const token = localStorage.getItem("authToken");
  return token !== null;
}

export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};
