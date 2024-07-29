function generateSchemaName(customSchemaName, node) {
    const defaultSchema = target.schema;
    let schemaPrefix = env.get('schema_prefix', '');

    if (schemaPrefix.length > 0) {
        schemaPrefix = schemaPrefix + "_";
    }

    if (customSchemaName === null) {
        return `${schemaPrefix}${defaultSchema}`;
    } else {
        return `${schemaPrefix}${defaultSchema}_${customSchemaName.trim()}`;
    }
}

function generatePrefixedTargetName() {
    const defaultSchema = target.schema;
    let schemaPrefix = env.get('schema_prefix', '');

    if (schemaPrefix.length > 0) {
        schemaPrefix = schemaPrefix + "_";
    }

    return `${schemaPrefix}${defaultSchema}`;
}