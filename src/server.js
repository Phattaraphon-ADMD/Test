const { createApp } = require('./app');

const DEFAULT_PORT = 3000;
const port = Number(process.env.PORT) || DEFAULT_PORT;

createApp().listen(port, () => {
  console.info(`API listening on port ${port}`);
});
