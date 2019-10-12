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

    const getMainCardsGames = (req, res) => {
        
        app.db('games')
            .whereNotIn('id', function () {
                this.select('game_id').from('rejected');
            })
            .andWhere('user_id', '<>', req.user.id)
            .andWhere('status', '=', 0)
            .limit(10)
            .then(games => res.json(games))
            .catch(err => res.status(400).json(err))
    }


    return { saveGame, deleteGame, getMainCardsGames, getUserGames  }
}