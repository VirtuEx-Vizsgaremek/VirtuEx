alter table "subscription"
  add column if not exists "billing_period" varchar not null default 'monthly',
  add column if not exists "pending_plan_id" bigint null,
  add column if not exists "pending_billing_period" varchar null,
  add column if not exists "pending_effective_at" timestamptz null;

alter table "subscription"
  add constraint if not exists "subscription_pending_plan_id_foreign"
  foreign key ("pending_plan_id") references "subscription_plan" ("id") on update cascade;
