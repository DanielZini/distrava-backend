
exports.up = function(knex) {
    return knex.schema.createTable('users', table => {
        table.increments('id').primary();
        table.string('name').notNull();
        table.string('photo').notNull().defaultTo('defaultPerson.png');
        table.string('city').notNull();
        table.string('state').notNull();
        table.string('whatsapp').notNull();
        table.string('email').notNull();
        table.string('password').notNull();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
