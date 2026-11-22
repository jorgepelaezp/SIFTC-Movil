// Toma la configuración de app.json y solo cambia la ruta de google-services.json:
// - En EAS Build usa el archivo secreto GOOGLE_SERVICES_JSON.
// - En tu PC usa el archivo local ./google-services.json.
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
  },
});