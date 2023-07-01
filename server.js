const dotenv = require('dotenv');
//process.on('uncaughtException', err => { 
  //console.log(err.name, err.message);
  //process.exit(1);
//})

// Connecting env variables
dotenv.config({ path: './config.env' });
const app = require('./app');

// Start server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listening from port ${port}`)
});

//For handeling unhandled promise rejection
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('Unhandled Rejection!!! Shutting down...');
  server.close(() => {
      process.exit(1);
  });
})

//For handeling SIGTERM signal
process.on('SIGTERM', () => {
  console.log('SIGTERM Recieved...Shutting down gracefully..');
  server.close(() => {
      console.log('Process Terminated');
  })
})

