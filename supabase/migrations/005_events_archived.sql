-- Soft-archive: hidden from event picker; data retained in DB.
alter table events add column if not exists archived_at timestamptz;

create index if not exists events_archived_at_idx on events (archived_at)
  where archived_at is not null;
