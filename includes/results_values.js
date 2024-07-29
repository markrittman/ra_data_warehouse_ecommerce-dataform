function resultsValues(results, target) {
  let values = '';
  for (let i = 0; i < results.length; i++) {
    const res = results[i];
    if (i > 0) {
      values += ',';
    }
    values += `('${res.node.alias}', '${res.status}', 
      case when '${res.status}' like 'CREATE TABLE%' or '${res.status}' like 'MERGE%' then`;
    if (target.type === 'bigquery') {
      values += `safe_cast(replace(split('${res.status}','(')[1].replace(')',''), '') as numeric)`;
    } else if (target.type === 'snowflake') {
      values += `try_cast(replace('${res.status}'.split('(')[2].replace(')',''), '') as numeric)`;
    } else if (target.type === 'redshift') {
      values += `replace('${res.status}'.split('(')[2].replace(')',''), '')::int`;
    } else {
      values += `${target.type} not supported in this project`;
    }
    values += ` else 0 end, ${res.execution_time}, ${dbt_utils.current_timestamp()})`;
  }
  return values;
}