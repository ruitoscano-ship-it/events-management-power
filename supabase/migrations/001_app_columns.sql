-- Colunas usadas pela app (idempotente)
alter table events add column if not exists edition_label text;

alter table contributions add column if not exists destination text;
alter table contributions add column if not exists needed_count int;
