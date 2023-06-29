
const dropColumn = (knex, tableName, columnName) => {
    // knex does not have a dropColumnIfExists :\
    return knex.schema.hasColumn(tableName, columnName).then((hasColumn) => {
        if(hasColumn) {
            return knex.schema.alterTable(tableName, table => {
                table.dropColumn(columnName)
            })
        } else {
            return null
        }
    })
}

module.exports = { dropColumn }