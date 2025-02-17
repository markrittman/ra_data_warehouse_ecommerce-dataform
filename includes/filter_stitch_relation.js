function filterStitchRelation(relation, uniqueColumn) {
  return `
SELECT
  *
FROM
  (
    SELECT
      *,
      MAX(_sdc_batched_at) OVER (PARTITION BY ${uniqueColumn} ORDER BY _sdc_batched_at RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS max_sdc_batched_at
    FROM
      ${relation}
  )
WHERE
  _sdc_batched_at = max_sdc_batched_at
`;
}