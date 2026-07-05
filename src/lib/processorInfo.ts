// Descriptions of ClickHouse's query pipeline processors, keyed by the
// exact string each returns from its `getName()` — which is what ends up
// in `system.processors_profile_log.name`. Many processors report a name
// shorter than their C++ class (e.g. `LimitTransform` reports "Limit",
// `ReplacingSortedTransform` reports "ReplacingSorted"), so these keys are
// taken directly from ClickHouse's source rather than guessed from class
// naming conventions. Verified against ClickHouse/ClickHouse @ master.

const DESCRIPTIONS: Record<string, string> = {
  // --- Sources (produce rows, no input ports) ---
  NullSource: 'Produces no rows — a placeholder used where the pipeline needs a valid input that yields nothing.',
  Remote: 'Reads result blocks streamed back from a remote shard or replica for a distributed query.',
  RemoteTotals: 'Reads the WITH TOTALS block returned by a remote shard.',
  RemoteExtremes: 'Reads the EXTREMES block returned by a remote shard.',
  UnmarshallBlocksTransform: 'Deserializes blocks received over a remote connection back into an in-memory format.',
  Delayed: "Wraps another source and defers pulling from it until it's first needed, e.g. to build a subquery's pipeline lazily.",
  LazyReadFromMergeTreeSource:
    'Reads just the columns needed to identify matching rows first, deferring the rest of the columns until later (lazy materialization).',
  LazyUnorderedReadFromMergeTreeSource:
    'The unordered, fully-parallel read path for the lazy materialization strategy — same idea as LazyReadFromMergeTreeSource without preserving order.',
  LazyReadReplacingFinalSource: 'Lazily reads the remaining columns for rows selected by a ReplacingMergeTree FINAL query.',
  BlocksListSource: 'Emits rows from an in-memory list of pre-built blocks.',
  Blocks: 'Emits rows from an in-memory list of pre-built blocks.',
  ConstChunkGenerator: 'Emits a fixed/constant chunk repeatedly, e.g. for a constant-only SELECT.',
  SourceFromSingleChunk: 'Emits a single pre-computed chunk already sitting in memory.',
  SourceFromChunks: 'Emits a sequence of pre-computed chunks already sitting in memory.',
  Primes: 'Generates rows for the system.primes table function.',
  PrimesSimpleRange: 'Generates a simple contiguous range of prime numbers for the system.primes table function.',
  JemallocProfile: 'Emits jemalloc heap-profiling data for introspection.',
  MongoDB: 'Reads rows from an external MongoDB collection.',
  MySQL: 'Reads rows from an external MySQL table.',
  PostgreSQL: 'Reads rows from an external PostgreSQL table.',
  SQLite: 'Reads rows from an external SQLite table.',
  ArrowFlightSource: 'Reads rows from an external source over the Arrow Flight protocol.',
  YTsaurusTableSourceStaticTable: 'Reads rows from a static YTsaurus table.',
  YTsaurusTableSourceDynamicTable: 'Reads rows from a dynamic YTsaurus table.',
  ReadFromCommonBufferSource: 'Reads from a shared in-memory buffer, used to fan the same intermediate result out to multiple consumers.',
  ReadFromDistributedPlanSource: 'Reads results produced by a fragment of a distributed query plan executed elsewhere.',
  RecursiveCTESource: 'Produces rows for a recursive common table expression (WITH RECURSIVE), iterating until no new rows are produced.',
  ShellCommandSource: "Reads rows piped from an external command's stdout (e.g. the `executable` table function).",
  ThrowingExceptionSource: 'Always raises an exception when read from — used for error-injection and testing.',
  WaitForAsyncInsert: 'Blocks until an asynchronous insert this query depends on has been flushed, before producing rows.',
  NativeCompressedSource: "Reads rows from a compressed stream in ClickHouse's Native wire format.",

  // --- Sinks (consume rows, no output ports) ---
  NullSink: 'Discards every block written to it.',
  NullSinkToStorage: "A no-op storage sink used when a table engine doesn't need to persist the written data.",
  EmptySink: 'Consumes and discards blocks without acting on them.',
  RemoteSink: 'Sends blocks to a remote shard or replica as part of a distributed INSERT.',
  NativeCompressedSink: "Writes rows to a compressed stream in ClickHouse's Native wire format.",

  // --- Merges (k-way merge of sorted streams; also drives MergeTree engine-specific row combining) ---
  MergingSortedTransform: 'Merges several sorted input streams into one sorted output stream, preserving global order.',
  CollapsingSortedTransform: 'Merge-time row cancellation for CollapsingMergeTree — pairs matching rows with sign +1/-1 and drops them.',
  ReplacingSorted: 'Merge-time deduplication for ReplacingMergeTree — keeps only the newest row per sorting key.',
  SummingSortedTransform: 'Merge-time aggregation for SummingMergeTree — sums numeric columns for rows sharing the same sorting key.',
  AggregatingSortedTransform: 'Merge-time aggregation for AggregatingMergeTree — merges partial aggregate states for rows sharing the same sorting key.',
  VersionedCollapsingTransform: 'Merge-time row cancellation for VersionedCollapsingMergeTree, using a version column to order +1/-1 pairs correctly.',
  GraphiteRollupSortedTransform: 'Merge-time rollup for GraphiteMergeTree — applies retention/aggregation rules to older metric data points.',
  CoalescingSortedTransform: 'Merge-time column coalescing for CoalescingMergeTree — fills in non-null values across rows sharing the same sorting key.',
  FinishAggregatingInOrderTransform: 'Finalizes and merges partially-aggregated, order-preserving chunks produced by in-order aggregation.',

  // --- Core query transforms ---
  ExpressionTransform: 'Evaluates a chain of expressions (functions, casts, computed columns) over each incoming chunk.',
  ConvertingTransform: "Converts a block's columns to match a target header's types/order, e.g. before a UNION or insert.",
  FilterTransform: 'Applies a WHERE/HAVING/PREWHERE-style filter, dropping rows that fail the filter condition.',
  AggregatingTransform: 'Computes GROUP BY aggregate states for each input chunk — the "map" side of aggregation.',
  AggregatingInOrderTransform: 'Aggregates GROUP BY data incrementally as it arrives already sorted by the grouping key, avoiding a full hash table.',
  FinalizeAggregatedTransform: 'Converts intermediate aggregate states produced by in-order aggregation into their final values.',
  MergingAggregatedTransform: 'Merges partial aggregate states from multiple upstream threads/shards into final results — the "reduce" side of aggregation.',
  GroupingAggregatedTransform: 'Groups partial aggregate data by bucket as part of the memory-efficient merge-aggregation strategy.',
  MergingAggregatedBucketTransform: 'Merges one bucket of partial aggregate states as part of the memory-efficient merge-aggregation strategy.',
  SortingAggregatedTransform: 'Sorts partially-aggregated buckets so they can be merged in order without holding everything in memory at once.',
  SortingAggregatedForMemoryBoundMergingTransform:
    'Sorts partially-aggregated data to support memory-bound merging of aggregation results.',
  MergeSorterSource: 'Internal helper that merges pre-sorted runs together while producing the sorted output of a SortingTransform.',
  PartialSortingTransform: 'Sorts each incoming chunk individually (an in-memory partial sort) — the first stage of an ORDER BY.',
  MergeSortingTransform: 'Merges multiple partially-sorted chunks into fewer, larger sorted chunks, spilling to disk if needed.',
  FinishSortingTransform: 'Produces the final fully-sorted stream by merging chunks that are already sorted, e.g. reading a MergeTree in key order.',
  Limit: 'Applies LIMIT, passing through only the requested row window and stopping the query early once satisfied.',
  Offset: 'Skips the first N rows for an OFFSET clause.',
  NegativeLimit: 'A LIMIT variant that counts from the end of the stream (e.g. negative LIMIT).',
  NegativeOffset: 'An OFFSET variant that counts from the end of the stream.',
  FractionalLimit: 'A LIMIT variant that accepts a fraction of total rows rather than an absolute count.',
  FractionalOffset: 'An OFFSET variant that accepts a fraction of total rows rather than an absolute count.',
  LimitByTransform: 'Implements LIMIT n BY expr, keeping only the first n rows per distinct value of expr.',
  LimitBySortedStreamTransform: 'A cheaper LIMIT n BY for input already sorted on expr, comparing only against the previous row.',
  NegativeLimitByTransform: 'A LIMIT n BY variant that keeps the last n rows per group instead of the first.',
  NegativeLimitBySortedStreamTransform: 'A cheaper NegativeLimitBy for input already sorted on the grouping expression.',
  DistinctTransform: 'Implements SELECT DISTINCT by filtering out rows whose column values have already been seen.',
  DistinctSortedTransform: 'A cheaper DISTINCT for input already sorted on the distinct columns, comparing only against the previous row.',
  DistinctSortedStreamTransform: 'A cheaper DISTINCT for a single sorted stream, comparing only against the previous row.',
  ExtremesTransform: "Tracks each column's minimum/maximum values to produce the query's EXTREMES result.",
  TotalsHavingTransform: 'Applies HAVING and computes the WITH TOTALS row for a GROUP BY query.',
  RollupTransform: 'Produces the extra grouping-set rows for GROUP BY ... WITH ROLLUP.',
  CubeTransform: 'Produces the extra grouping-set rows for GROUP BY ... WITH CUBE.',
  ArrayJoinTransform: 'Expands array/map columns into multiple rows for ARRAY JOIN.',
  WindowTransform: 'Computes window functions (OVER (...)) over partitioned, ordered input.',
  FillingTransform: 'Implements ORDER BY ... WITH FILL, generating missing rows to fill gaps in a sequence.',
  FillingNoopTransform: 'A no-op stand-in for FillingTransform used when WITH FILL has nothing to do for a given stream.',
  CreatingSetsTransform: 'Builds the in-memory sets needed to evaluate IN (subquery) and JOIN conditions before the main query runs.',
  CreatingSetsOnTheFlyTransform: 'Builds a filter set from one side of a JOIN while data is still streaming, letting the other side filter early.',
  FilterBySetOnTheFlyTransform: 'Filters rows using a set thats still being built concurrently — a JOIN/IN optimization.',
  JoiningTransform: 'Performs the JOIN of the current stream against the already-built other side.',
  FillingRightJoinSide: "Reads and buffers a JOIN's right-hand side so it's ready before probing begins.",
  DelayedJoinedBlocksTransform: 'Coordinates producing extra "unmatched" blocks for a RIGHT/FULL JOIN after the main join pass.',
  DelayedJoinedBlocksWorkerTransform: 'Worker that produces the delayed "unmatched" blocks for a RIGHT/FULL JOIN.',
  NonJoinedBlocksTransform: 'Emits the unmatched rows needed to complete a RIGHT or FULL OUTER JOIN.',
  MergeJoinTransform: 'Performs a JOIN by merging two already-sorted streams on the join key.',
  PasteJoinTransform: 'Performs a positional "paste" join, combining two streams row-by-row without a join key.',
  IntersectOrExcept: 'Computes the rows for an INTERSECT or EXCEPT between two result sets.',
  SquashingTransform: 'Combines many small chunks into fewer, larger ones to reduce per-block overhead.',
  SimpleSquashingTransform: 'A simpler variant of chunk squashing that combines small chunks into larger ones.',
  ApplySquashingTransform: 'Applies a previously-configured squashing policy to combine chunks.',
  PlanSquashingTransform: 'Squashes chunks according to sizing hints derived from the query plan.',
  MaterializingTransform: 'Converts lazily-computed, sparse, or constant columns in a chunk into fully materialized regular columns.',
  MaterializingCTETransform: 'Materializes the result of a shared CTE/subquery so later parts of the query can reuse it.',
  LazyMaterializingTransform: 'Fetches the actual column data for rows selected via the lazy materialization strategy, once needed.',
  LazyFinalKeyAnalysisTransform: "Analyzes a MergeTree FINAL query's sorting-key columns to decide which rows need full merging.",
  VirtualRowTransform: 'Injects synthetic marker rows used to compare progress between MergeTree parts during a FINAL/merge read.',
  CountingTransform: 'Tracks the number of rows/bytes passing through, used for progress reporting and quota accounting.',
  Copy: 'Duplicates a single input stream out to multiple output ports unchanged.',
  ColumnGathererTransform: 'Reassembles a single output column from several input parts while merging MergeTree data parts.',
  ColumnPermuteTransform: "Reorders a chunk's columns to match a different column order.",
  SelectByIndicesTransform: 'Picks out a specific subset of rows from a chunk by row index.',
  ExtractColumnsTransform: 'Extracts a subset of columns from a wider block, e.g. named subcolumns of an Object/Tuple.',
  CheckConstraintsTransform: "Validates that each row satisfies the table's CONSTRAINT expressions during an insert.",
  CheckSortedTransform: "Verifies incoming data really is sorted the way the pipeline expects, raising an error if it isn't.",
  AddingDefaultsTransform: 'Fills in default column values for columns missing from an insert.',
  RemovingSparseTransform: 'Converts sparse-encoded columns into their normal, fully materialized representation.',
  RemovingReplicatedColumnsTransform: 'Strips internal replication bookkeeping columns before returning results.',
  ReverseTransform: 'Reverses the order of rows within each chunk, used for descending-order reads.',
  ScatterByPartitionTransform: 'Splits a stream into separate output ports by partition key, e.g. before a parallel distributed write.',
  BufferedShardByHashTransform: 'Buffers and routes rows to a shard output port based on a hash of the sharding key.',
  InputSelectorTransform: 'Chooses which of several input ports to read from next, based on a selector column/condition.',
  StreamInQueryResultCacheTransform: 'Taps a stream to also store its results in the query result cache as they pass through.',
  SaveSubqueryResultToBuffer: "Buffers a subquery's output so it can be reused elsewhere in the query plan without recomputing it.",
  BuildRuntimeFilterTransform: "Builds a runtime filter from one side of a join/subquery to let another part of the plan prune rows earlier.",
  TTL: 'Applies row/column TTL (time-to-live) expiration rules, e.g. deleting or rolling up expired data during a merge.',
  TTL_CALC: 'Computes TTL expiration values for rows so they can be stored or acted on later.',
  TTLDeleteFilter: 'Filters out rows whose TTL has expired.',
  WatermarkTransform: 'Tracks a streaming watermark to know when a windowed/streaming computation is complete.',
  RestoreChunkInfosTransform: 'Restores per-chunk insert-deduplication metadata that needs to survive a pipeline stage.',
  AddDeduplicationInfoTransform: 'Attaches insert-deduplication metadata (block IDs/hashes) to chunks as they move through an INSERT pipeline.',
  RedefineDeduplicationInfoWithDataHashTransform: "Recomputes a chunk's deduplication token from a hash of its actual data.",
  SelectPartitionTransform: 'Tags chunks with which partition they belong to, for per-partition insert deduplication.',
  UpdateDeduplicationInfoWithViewIDTransform: "Folds a materialized view's ID into the deduplication token so each view dedups independently.",
  AddSequenceNumber: 'Tags each chunk with a sequence number before it may be processed out of order by parallel workers.',
  SortChunksBySequenceNumber: 'Re-sorts chunks back into their original order using the sequence numbers assigned by AddSequenceNumber.',
  DroppingTransform: 'Discards all input without passing anything through.',
  LimitsCheckingTransform: 'Enforces query-level limits (max rows/bytes, timeouts) as data streams through.',
  NestedElementsValidationTransform: "Validates that nested/array-typed columns' internal arrays have matching, valid lengths.",

  // --- Pipeline plumbing (routing only, no real computation) ---
  Resize: 'Redistributes chunks across a different number of input/output ports, changing the degree of parallelism.',
  StrictResize: 'Like Resize, but preserves a strict one-to-one correspondence between specific input/output ports.',
  Concat: 'Concatenates several input streams one after another into a single output stream.',
  Fork: 'Duplicates a single input stream to multiple output ports, e.g. feeding both the main result and WITH TOTALS.',
  DelayedPorts: 'Holds back data on some ports until others are ready, used to sequence branches of the pipeline.',
  ReadHeadBalancedProcessor:
    'Coordinates a pair of processor instances so one signals the other once a condition (like "enough data buffered") is met, balancing parallel reads.',

  // --- Formats ---
  LazyOutputFormat: "Buffers the query's final result so the client can pull it row-batch by row-batch rather than all at once.",
  PullingOutputFormat: 'A pull-based output format used when the caller fetches result blocks synchronously, one at a time.',
};

const MERGE_TREE_SELECT_RE = /^MergeTreeSelect\(pool: (.+), algorithm: (.+)\)$/;

const FORMAT_PATTERNS: [RegExp, (format: string) => string][] = [
  [/^(.+)RowInputFormat$/, (f) => `Parses input rows in the ${f} format.`],
  [/^(.+)RowOutputFormat$/, (f) => `Serializes output rows in the ${f} format.`],
  [/^(.+)BlockInputFormat$/, (f) => `Parses input blocks in the ${f} format.`],
  [/^(.+)BlockOutputFormat$/, (f) => `Serializes output blocks in the ${f} format.`],
  [/^(.+)InputFormat$/, (f) => `Reads input data in the ${f} format.`],
  [/^(.+)OutputFormat$/, (f) => `Writes output data in the ${f} format.`],
];

// Looks up a human-readable description for a processor's exact
// `processors_profile_log.name` value. Returns null if nothing — including
// the pattern-based fallbacks — matches, so callers can omit the section
// entirely rather than show a placeholder.
export function getProcessorDescription(name: string): string | null {
  if (name in DESCRIPTIONS) return DESCRIPTIONS[name];

  const mergeTreeMatch = name.match(MERGE_TREE_SELECT_RE);
  if (mergeTreeMatch) {
    const [, pool, algorithm] = mergeTreeMatch;
    return (
      `Reads a range of a MergeTree table's parts (read pool: ${pool}, ` +
      `per-thread strategy: ${algorithm}).`
    );
  }
  if (name.startsWith('MergeTreeSelect')) {
    return "Reads a range of a MergeTree table's parts.";
  }

  for (const [pattern, describe] of FORMAT_PATTERNS) {
    const match = name.match(pattern);
    if (match) return describe(match[1]);
  }

  return null;
}
