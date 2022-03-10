import { CronJob } from 'cron'
import { Video } from '../shared/models'
import { uploadConvertedToYoutube } from '../shared/services/exporter';

const console = process.console

var job = new CronJob({
  cronTime: '*/30 * * * *',
  onTick: function () {
    console.log('Retry failed youtube videos');
    Video.find({
      youtubeUploadStatus: 'failed',
      youtubeUploadRetries: { $lt: 4, $gt: 1 },
    })
      .then(videos => {
        console.log('Got failed videos', videos.length);
        videos.forEach(video => uploadConvertedToYoutube(video._id));
      })
      .catch(err => {
        console.log('Something went wrong fetching failed videos', err)
      })
  },
  timeZone: 'Asia/Kolkata'
})

// runBot(NumberOfArticlesPerUpdate)
job.start()
console.log('Started cron job for retrying failed youtube uploads at', Date())
