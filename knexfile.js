// Update with your config settings.
// const env = require('./.env');

module.exports = {


	client: 'postgresql',
	connection: {
		host: 		process.env.DATABASE_URL,
		database:	process.env.DATABASE_NAME,
		user:    	process.env.DATABASE_USER,
		password:	process.env.DATABASE_PASSWORD
	},
	pool: {
		min: 2,
		max: 10
	},
	migrations: {
		tableName: 'knex_migrations'
	}

};
