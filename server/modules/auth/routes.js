import controller from './controller';

export const mount = (passport) => function(router) {
  router.get('/session', controller.validateSession)

  router.get('/logout', controller.logOut);

  // router.get('/wikiCommons/callback', passport.authenticate('wikiCommons'), (req, res) => {
  //   res.json({ query: req.query, user: req.user, session: req.session })
  // })

  // router.get('/wikiCommons', passport.authenticate('wikiCommons'));

  router.post('/youtube/authenticate/generate', controller.generateYoutubeAuthLink);
  router.get('/youtube/authenticate/connect', controller.connectYoutubeChannel);

  return router;
}

export default (passport) => ({
  mount: mount(passport),
})
