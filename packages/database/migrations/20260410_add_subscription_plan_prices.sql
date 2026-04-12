alter table "subscription_plan"
  add column if not exists "monthly_price" int not null default 0,
  add column if not exists "yearly_price" int not null default 0;

update "subscription_plan"
set "monthly_price" = "price" * 100
where "monthly_price" = 0;

update "subscription_plan"
set "yearly_price" = "monthly_price" * 12
where "yearly_price" = 0;
