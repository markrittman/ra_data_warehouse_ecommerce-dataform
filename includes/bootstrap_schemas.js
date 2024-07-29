function bootstrapSchemas(stagingSchemaName, seedSchemaName, reset) {
    const schemaPrefix = env_var('schema_prefix', '');

    if (schemaPrefix.length > 0) {
        schemaPrefix = schemaPrefix + "_";
    }

    let sql = '';

    if (reset) {
        sql += `DROP SCHEMA IF EXISTS ${target.database}.${schemaPrefix}${target.schema};\n`;
        sql += `DROP SCHEMA IF EXISTS ${target.database}.${schemaPrefix}${target.schema}_${stagingSchemaName};\n`;
        sql += `DROP SCHEMA IF EXISTS ${target.database}.${schemaPrefix}${target.schema}_logs;\n`;
        sql += `DROP SCHEMA IF EXISTS ${target.database}.${schemaPrefix}${target.schema}_${seedSchemaName};\n`;
    }

    sql += `CREATE SCHEMA IF NOT EXISTS ${target.database}.${schemaPrefix}${target.schema};\n`;
    sql += `CREATE SCHEMA IF NOT EXISTS ${target.database}.${schemaPrefix}${target.schema}_${stagingSchemaName};\n`;
    sql += `CREATE SCHEMA IF NOT EXISTS ${target.database}.${schemaPrefix}${target.schema}_logs;\n`;
    sql += `CREATE SCHEMA IF NOT EXISTS ${target.database}.${schemaPrefix}${target.schema}_${seedSchemaName};\n`;

    return sql;
}

function dropSchemas(stagingSchemaName, seedSchemaName, logsSchemaName) {
    let sql = '';

    sql += `DROP SCHEMA IF EXISTS ${target.database}.${schemaPrefix}${target.schema};\n`;
    sql += `DROP SCHEMA IF EXISTS ${target.database}.${schemaPrefix}${target.schema}_${stagingSchemaName};\n`;
    sql += `DROP SCHEMA IF EXISTS ${target.database}.${schemaPrefix}${target.schema}_logs;\n`;
    sql += `DROP SCHEMA IF EXISTS ${target.database}.${schemaPrefix}${target.schema}_${seedSchemaName};\n`;

    return sql;
}