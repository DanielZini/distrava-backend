module.exports = app => {

    const saveGame = (req, res) => {

        app.db('games')
            .insert(
                {
                    name: req.body.gameName,
                    photo: req.body.gameUri,
                    platform: req.body.platformUri,
                    rating_box: req.body.ratingBox,
                    rating_media: req.body.ratingMedia,
                    rating_manual: req.body.ratingManual,
                    user_id: req.user.id,
                }
            )
            .returning('id')
            .then(async function (id) { 
                // LIKE AUTOMÁTICO TOADA VEZ QUE UM USUÁRIO INSERIR UM JOGO ---
                // APENAS PARA TESTE DA FACULDADE ---

                if(req.user.id !== 3){
                    
                    await app.db('wanted')
                        .insert(
                            {
                                user_id: 3,
                                game_id: id[0]
                            }
                        )
                        .catch(err => res.status(400).json('NAO FOI'));
                }

            })
            .then(_ => res.status(204).send())
            .catch(err => res.status(400).json(err))
    }

    const deleteGame = (req, res) => {
        app.db('games')
            .where({ id: req.params.id, user_id: req.user.id })
            .del()
            .then(rowsDeleted => {
                if (rowsDeleted > 0) {
                    res.status(204).send();
                } else {
                    const msg = `Não foi encontrado esse jogo`
                    res.status(400).send(msg);
                }
            })
            .catch(err => res.status(400).json(err));
    }

    const getUserGames = (req, res) => {
        
        app.db('games')
            .where({ user_id: req.user.id })
            .orderBy('name')
            .then(games => res.json(games))
            .catch(err => res.status(400).json(err))
    }

    function getRejectedGames(user_id) {
        var dataArr = [];
        return app.db.select('game_id')
            .from('rejected')
            .then(function (result) {
                result.forEach(function (value) {
                    dataArr.push(value.game_id)
                });
                return dataArr;
            });
    }

    function getWantedGames(user_id) {
        var dataArr = [];
        return app.db.select('game_id')
            .from('wanted')
            .then(function (result) {
                result.forEach(function (value) {
                    dataArr.push(value.game_id)
                });
                return dataArr;
            });
    }

    const getMainCardsGames = async (req, res) => {

        let arr_rejected = await getRejectedGames(req.user.id);
        let arr_wanted = await getWantedGames(req.user.id);

        arr_wanted.forEach(el => {
            arr_rejected.push(el)
        });
            
        app.db.select(
            'games.id',
            'games.name',
            'games.photo',
            'games.platform',
            'games.platform',
            'games.rating_box',
            'games.rating_media',
            'games.rating_manual',
            'games.status',
            'games.user_id',
            'users.city',
            'users.state',
            )
            .from('games')
            .join('users', 'users.id', '=', 'games.user_id')
            .whereNotIn('games.id', arr_rejected)
            .andWhere('games.user_id', '<>', req.user.id)
            .andWhere('games.status', '=', 0)
            .limit(3)
            .then(games => res.json(games))
            .catch(err => res.status(400).json(err))
    }

    return { saveGame, deleteGame, getMainCardsGames, getUserGames  }
}