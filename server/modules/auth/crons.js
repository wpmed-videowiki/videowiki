import { CronJob } from 'cron';
import utils from './utils';
import services from './services';

const console = process.console;

var job = new CronJob({
  cronTime: '30 12 * * *',
  onTick: function() {
    utils.refreshYoutubeToken()
    .then(token => {
      console.log(token)
      services.rabbitmq.onYoutubeAuth(token);
    })   
    .catch(err => {
      console.log('Error refreshing youtube token', err);
    })
  },
  timeZone: 'Asia/Kolkata',
});

// runBot(NumberOfArticlesPerUpdate)
job.start();
console.log('Started cron job for refreshing youtube token at', Date());