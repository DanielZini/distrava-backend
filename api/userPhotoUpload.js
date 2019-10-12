const multer = require('multer');

module.exports = app => {

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './public/upload');
        },
        filename: (req, file, cb) => {
            console.log(file);
            var filetype = '';
            if (file.mimetype === 'image/gif') {
                filetype = 'gif';
            }
            if (file.mimetype === 'image/png') {
                filetype = 'png';
            }
            if (file.mimetype === 'image/jpeg') {
                filetype = 'jpg';
            }
            cb(null, 'photo-' + Date.now() + '.' + filetype);
        }
    });

    const doUpload = multer({ storage: storage });

    const resUpload = (req, res, next) => {

        if (!req.file) {
            res.status(500);
            return next(err);
        }

        app.db('users')
            .where({id: req.user.id})
            .update({
                photo: req.file.filename
            })
            .then(_ => res.status(204).send())
            .catch(err => res.status(400).json(err))

    }

    return { doUpload, resUpload }

}