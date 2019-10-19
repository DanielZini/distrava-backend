

module.exports = app => {

    // Auth ----
    app.post('/signup', app.api.user.save);
    app.post('/signin', app.api.auth.signin);

    // User ----
    app.route('/update-user')
        .all(app.config.passport.authenticate())
        .post(app.api.user.updateUser);

    app.route('/get-user')
        .all(app.config.passport.authenticate())
        .get(app.api.user.getLoggedUser);

    app.route('/delete-user')
        .all(app.config.passport.authenticate())
        .delete(app.api.user.deleteUser);

    // Game ----
    app.route('/save-game')
        .all(app.config.passport.authenticate())
        .post(app.api.game.saveGame);

    app.route('/delete-game/:id')
        .all(app.config.passport.authenticate())
        .delete(app.api.game.deleteGame);

    app.route('/list-users-games')
        .all(app.config.passport.authenticate())
        .get(app.api.game.getUserGames);

    app.route('/list-main-cards-games')
        .all(app.config.passport.authenticate())
        .get(app.api.game.getMainCardsGames);

    // Exchanges ---
    app.route('/wanted-game')
        .all(app.config.passport.authenticate())
        .post(app.api.exchanges.wantedGame);

    app.route('/rejected-game')
        .all(app.config.passport.authenticate())
        .post(app.api.exchanges.rejectedGame);

    app.route('/update-status-exchange')
        .all(app.config.passport.authenticate())
        .post(app.api.exchanges.updateStatusExchange);

    app.route('/get-exchanges')
        .all(app.config.passport.authenticate())
        .get(app.api.exchanges.getExchanges);

    // Upload ---
    app.route('/upload-photo')
        .all(app.config.passport.authenticate())
        .post(app.api.userPhotoUpload.doUpload.single('file'), app.api.userPhotoUpload.resUpload);
}