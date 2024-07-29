function profileSchema(tableSchema) {
  const notNullProfileThresholdPct = 0.9;
  const uniqueProfileThresholdPct = 0.9;

  const tables = dbtUtils.getRelationsByPrefix(tableSchema, '');

  let sqlQuery = `
    SELECT column_stats.table_catalog,
           column_stats.table_schema,
           column_stats.table_name,
           column_stats.column_name,
           CASE WHEN column_metadata.is_nullable = 'YES' THEN false ELSE true END AS is_not_nullable_column,
           CASE WHEN column_stats.pct_not_null > ${notNullProfileThresholdPct} THEN true ELSE false END AS is_recommended_not_nullable_column,
           column_stats._nulls AS count_nulls,
           column_stats._non_nulls AS count_not_nulls,
           column_stats.pct_not_null AS pct_not_null,
           column_stats.table_rows,
           column_stats.count_distinct_values,
           column_stats.pct_unique,
           CASE WHEN column_stats.pct_unique >= ${uniqueProfileThresholdPct} THEN true ELSE false END AS is_recommended_unique_column,
           column_metadata.* EXCEPT (table_catalog, table_schema, table_name, column_name, is_nullable),
           column_stats.* EXCEPT (table_catalog, table_schema, table_name, column_name, _nulls, _non_nulls, pct_not_null, table_rows, pct_unique, count_distinct_values)
    FROM (
  `;

  tables.forEach((table, index) => {
    sqlQuery += `
      SELECT *
      FROM (
        WITH
          table AS (SELECT * FROM ${table}),
          tableAsJson AS (SELECT REGEXP_REPLACE(TO_JSON_STRING(t), r'^{|}$', '') AS ROW FROM table AS t),
          pairs AS (SELECT REPLACE(column_name, '"', '') AS column_name, IF (SAFE_CAST(column_value AS STRING)='null',NULL, column_value) AS column_value
                    FROM tableAsJson, UNNEST(SPLIT(ROW, ',"')) AS z, UNNEST([SPLIT(z, ':')[SAFE_OFFSET(0)]]) AS column_name, UNNEST([SPLIT(z, ':')[SAFE_OFFSET(1)]]) AS column_value),
          profile AS (
          SELECT
            SPLIT(REPLACE('${table}','\`',''),'.' )[SAFE_OFFSET(0)] AS table_catalog,
            SPLIT(REPLACE('${table}','\`',''),'.' )[SAFE_OFFSET(1)] AS table_schema,
            SPLIT(REPLACE('${table}','\`',''),'.' )[SAFE_OFFSET(2)] AS table_name,
            column_name,
            COUNT(*) AS table_rows,
            COUNT(DISTINCT column_value) AS count_distinct_values,
            SAFE_DIVIDE(COUNT(DISTINCT column_value), COUNT(*)) AS pct_unique,
            COUNTIF(column_value IS NULL) AS _nulls,
            COUNTIF(column_value IS NOT NULL) AS _non_nulls,
            COUNTIF(column_value IS NOT NULL) / COUNT(*) AS pct_not_null,
            MIN(column_value) AS _min_value,
            MAX(column_value) AS _max_value,
            AVG(SAFE_CAST(column_value AS numeric)) AS _avg_value,
            APPROX_TOP_COUNT(column_value, 1)[OFFSET(0)] AS _most_frequent_value,
            MIN(LENGTH(SAFE_CAST(column_value AS STRING))) AS _min_length,
            MAX(LENGTH(SAFE_CAST(column_value AS STRING))) AS _max_length,
            ROUND(AVG(LENGTH(SAFE_CAST(column_value AS STRING))) AS _avr_length
          FROM
            pairs
          WHERE
            column_name <> ''
            AND column_name NOT LIKE '%-%'
          GROUP BY
            column_name
          ORDER BY
            column_name)
        SELECT
          *
        FROM
          profile
      )
    `;

    if (index < tables.length - 1) {
      sqlQuery += 'UNION ALL';
    }
  });

  sqlQuery += `
    ) column_stats
    LEFT OUTER JOIN (
      SELECT
        * EXCEPT (is_generated, generation_expression, is_stored, is_updatable)
      FROM
        ${tableSchema}.INFORMATION_SCHEMA.COLUMNS
    ) column_metadata
    ON  column_stats.table_catalog = column_metadata.table_catalog
    AND column_stats.table_schema = column_metadata.table_schema
    AND column_stats.table_name = column_metadata.table_name
    AND column_stats.column_name = column_metadata.column_name
  `;

  return sqlQuery;
}