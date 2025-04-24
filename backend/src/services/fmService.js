const axios = require("axios");
const dbService = require("./dbService");

let token = null;

const getAuthHeader = () => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json"
});

// Obtener configuración desde la BBDD
const getFMConfig = async () => {
  const prefs = await dbService.getPreferences();
  if (!prefs) throw new Error("No hay configuración de FileMaker en preferencias");
  return prefs;
};

// Login y guardar token
const login = async () => {
  const { filemakerHost, filemakerDatabase, filemakerUser, filemakerPass } = await getFMConfig();

  const url = `${filemakerHost}/fmi/data/vLatest/databases/${filemakerDatabase}/sessions`;

  const response = await axios.post(url, null, {
    auth: {
      username: filemakerUser,
      password: filemakerPass
    },
    headers: { "Content-Type": "application/json" }
  });
  console.log("Respuesta de FileMaker:", response);
  token = response.data.response.token;
  return token;
};

// Logout
const logout = async () => {
  const { filemakerHost, filemakerDatabase } = await getFMConfig();
  const url = `${filemakerHost}/fmi/data/vLatest/databases/${filemakerDatabase}/sessions/${token}`;

  const response = await axios.delete(url, { headers: getAuthHeader() });
  token = null;
  return response.data;
};

// Obtener registros desde un layout
const getRecords = async (layout) => {
  const { filemakerHost, filemakerDatabase } = await getFMConfig();

  if (!token) await login();

  const url = `${filemakerHost}/fmi/data/vLatest/databases/${filemakerDatabase}/layouts/${layout}/records`;

  const response = await axios.get(url, { headers: getAuthHeader() });
  return response.data.response.data;
};

module.exports = {
  login,
  logout,
  getRecords
};
