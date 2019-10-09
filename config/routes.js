module.exports = app => {
    app.post('/signup', app.api.user.save);
    app.post('/signin', app.api.auth.signin);

    app.route('/save-game')
        .all(app.config.passport.authenticate())
        .post(app.api.game.saveGame);

    app.route('/wanted-game')
        .all(app.config.passport.authenticate())
        .post(app.api.game.wantedGame);

    app.route('/rejected-game')
        .all(app.config.passport.authenticate())
        .post(app.api.game.rejectedGame);

    app.route('/delete-game/:id')
        .all(app.config.passport.authenticate())
        .delete(app.api.game.deleteGame);

    app.route('/list-users-games')
        .all(app.config.passport.authenticate())
        .get(app.api.game.getUserGames);

    app.route('/list-main-cards-games')
        .all(app.config.passport.authenticate())
        .get(app.api.game.getMainCardsGames);
}