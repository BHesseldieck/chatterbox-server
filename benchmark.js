var siege = require('siege');

siege()
  .on(3000)
  .for(100000).times
  .concurrent(1000)
  .get('/classes/messages')
  .attack();