// Update with your config settings.
const env = require('./.env');

module.exports = {


	client: 'postgresql',
	connection: {
		host: 		env.DATABASE_URL,
		database:	env.DATABASE_NAME,
		user:    	env.DATABASE_USER,
		password:	env.DATABASE_PASSWORD
	},
	pool: {
		min: 2,
		max: 10
	},
	migrations: {
		tableName: 'knex_migrations'
	}

};
