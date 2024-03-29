---
title: Athena Partition Projection
tags: 
 - aws
---

We can make sure Athena only reads as much data as it needs for a particular query by partitioning our data. We do this by storing the data files in a Hive folder structure that represents the patitions we'll use in our queries.

```bash
s3://mybucket/data/year=2021/month=06/day=27/file1.json
s3://mybucket/data/year=2021/month=06/day=27/file2.json
s3://mybucket/data/year=2021/month=06/day=28/file1.json
```

We can then create a table partitioned by the keys used in the folder structure.

```sql
CREATE EXTERNAL TABLE example (
    foo string,
    bar string,
    baz string
)
PARTITIONED BY (year int, month int, day int)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
LOCATION 's3://mybucket/data/'
```

We then need to tell Athena about the partitions. We can either do this with `ALTER TABLE example ADD PARTITION (year='2021, month=06, day=27);`, or by running `MSCK REPAIR TABLE example;`, which will crawl the folder structure and add any partitions it finds. Once the partitions are loaded we can query the data, restricting the query to just the required partitions:

```sql
SELECT * FROM example
WHERE year=2021 AND month=6 AND day=27
```

The problem with this is that we either need to know every about every partition before we can query the data, or repair the table to make sure our partitions are up to date - a process that will take longer and longer to run as our table grows.

There is a better way! By using [partition projection](https://docs.aws.amazon.com/athena/latest/ug/partition-projection.html) we can tell Athena where to look for partitions. At query time, if the partition doesn't exist, the query will just return no rows for that partition. Queries should also be faster when there are a lot of partitions, since Athena doesn't need to query the metadata store to find them.

```sql
CREATE EXTERNAL TABLE example (
    foo string,
    bar string,
    baz string
)
PARTITIONED BY (year int, month int, day int)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
LOCATION 's3://mybucket/data/'
TABLEPROPERTIES (
    'projection.enabled' = 'true',
    'projection.year.type' = 'integer',
    'projection.year.range' = '2020,2021',
    'projection.month.type' = 'integer',
    'projection.month.range' = '1-12',
    'projection.day.type' = 'integer',
    'projection.day.range' = '1-31',
    'storage.location.template' = 's3://mybucket/data/${year}/${month}/${day}/'
)
```

We can query this table immediately, without needing to run `ADD PARTITION` or `REPAIR TABLE`, since Athena now knows what partitions can exist. Since we need to provide Athena with the range of expected values for each key, the year partition range will eventually need to be updated to keep up with new data.

Another option is to project an actual `date` partition. This time we treat the date path in S3 (`yyyy/MM/dd`) as a single partition key, which Athena will read and convert to a date field. We call this partition `date_created` as `date` is a [reserved keyword](https://docs.aws.amazon.com/athena/latest/ug/reserved-words.html).

```sql
CREATE EXTERNAL TABLE example (
    foo string,
    bar string,
    baz string
)
PARTITIONED BY (date_created string)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
LOCATION 's3://mybucket/data/'
TBLPROPERTIES (
    'projection.enabled' = 'true',
    'projection.date_created.type' = 'date',
    'projection.date_created.format' = 'yyyy/MM/dd',
    'projection.date_created.interval' = '1',
    'projection.date_created.interval.unit' = 'DAYS',
    'projection.date_created.range' = '2021/01/01,NOW',
    'storage.location.template' = 's3://mybucket/data/${date_created}/'
)
```

With a date partition we no longer need to update the partition ranges. Using `NOW` for the upper boundary allows new data to automatically become queryable at the appropriate UTC time. We can also now use the `date()` function in queries and Athena will still find the required partitions to limit the amount of data read.

```sql
SELECT * FROM example
WHERE date_created >= date('2021-06-27')
```