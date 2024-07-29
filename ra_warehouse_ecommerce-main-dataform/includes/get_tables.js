function getTables(schema, prefix='', exclude='') {
    const query = `
        select
            distinct table_schema || '.' || table_name as ref
        from ${schema}.INFORMATION_SCHEMA.TABLES
        where table_schema = '${schema}'
    `;

    const tableList = dataform.queryResult(query);

    if (tableList && tableList.data) {
        const tables = tableList.data.map(row => row[0]);
        return tables;
    } else {
        return [];
    }
}