import { User } from '../shared/models';

const controller = {
  getLeaderboard(req, res) {
    const { limit } = req.query
    User
      .find({ totalEdits: { $ne: 0 } })
      .sort({ totalEdits: -1 })
      .limit(limit || 10)
      .select('firstName lastName email totalEdits')
      .exec().then((users) => {

        return res.json({ users })
      })
      .catch(err => {
        if (err) {
          return res.status(503).send('Error while fetching top users!')
        }
      })
  },
}

export default controller;
