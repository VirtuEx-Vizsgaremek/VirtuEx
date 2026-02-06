set names 'utf8';

create database "virtuex";

create type "currency_type" as enum ('fiat', 'crypto');
create type "code_type" as enum ('account_activation', 'password_reset');
create type "transaction_status" as enum ('pending', 'completed', 'failed');
create type "transaction_direction" as enum ('out', 'in');
create type "order_status" as enum ('pending', 'partially_filled', 'filled', 'cancelled', 'expired', 'rejected');
create type "order_type" as enum ('buy', 'sell');
create table "currency" ("id" bigserial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "symbol" varchar(255) not null, "name" varchar(255) not null, "precision" int not null, "type" "currency_type" not null default 'crypto');

create table "currency_history" ("currency_id" bigint not null, "timestamp" timestamptz not null, "price" bigint not null default 0, constraint "currency_history_pkey" primary key ("currency_id", "timestamp"));

create table "subscription_plan" ("id" bigserial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "name" varchar(255) not null, "monthly_ai_credits" int not null, "assets_max" int not null, "stop_loss" boolean not null default false, "real_time" boolean not null default false, "display_features" jsonb not null, "price" int not null);

create table "wallet" ("id" bigserial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null);

create table "user" ("id" bigserial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "full_name" varchar(1024) not null, "username" varchar(32) not null, "email" varchar(320) not null, "password" varchar(72) not null, "mfa_secret" varchar(255) null, "bio" varchar(256) null, "avatar" varchar(40) null, "wallet_id" bigint not null, "permissions" int not null default 0, "activated" boolean not null default false);
alter table "user" add constraint "user_username_unique" unique ("username");
alter table "user" add constraint "user_email_unique" unique ("email");
alter table "user" add constraint "user_wallet_id_unique" unique ("wallet_id");

create table "subscription" ("id" bigserial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" bigint not null, "plan_id" bigint not null, "started_at" timestamptz not null, "expires_at" timestamptz null);
alter table "subscription" add constraint "subscription_user_id_unique" unique ("user_id");

create table "code" ("id" bigserial primary key, "code" varchar(255) not null, "type" "code_type" not null, "user_id" bigint not null, "expires_at" timestamptz not null);
create index "code_code_index" on "code" ("code");

create table "asset" ("id" bigserial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "wallet_id" bigint not null, "currency_id" bigint not null, "amount" bigint not null);
alter table "asset" add constraint "asset_wallet_id_currency_id_unique" unique ("wallet_id", "currency_id");

create table "transaction" ("id" bigserial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "asset_id" bigint not null, "amount" bigint not null, "status" "transaction_status" not null default 'pending', "direction" "transaction_direction" not null);

create table "order" ("id" bigserial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" bigint not null, "from_asset_id" bigint not null, "to_asset_id" bigint not null, "amount" bigint not null, "status" "order_status" not null default 'pending', "type" "order_type" not null);

create table "fulfilled_order" ("id" bigserial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" bigint not null, "buy_order_id" bigint not null, "sell_order_id" bigint not null, "amount" bigint not null, "price" bigint not null);

alter table "currency_history" add constraint "currency_history_currency_id_foreign" foreign key ("currency_id") references "currency" ("id") on update cascade;

alter table "user" add constraint "user_wallet_id_foreign" foreign key ("wallet_id") references "wallet" ("id") on update cascade;

alter table "subscription" add constraint "subscription_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;
alter table "subscription" add constraint "subscription_plan_id_foreign" foreign key ("plan_id") references "subscription_plan" ("id") on update cascade;

alter table "code" add constraint "code_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;

alter table "asset" add constraint "asset_wallet_id_foreign" foreign key ("wallet_id") references "wallet" ("id") on update cascade;
alter table "asset" add constraint "asset_currency_id_foreign" foreign key ("currency_id") references "currency" ("id") on update cascade;

alter table "transaction" add constraint "transaction_asset_id_foreign" foreign key ("asset_id") references "asset" ("id") on update cascade;

alter table "order" add constraint "order_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;
alter table "order" add constraint "order_from_asset_id_foreign" foreign key ("from_asset_id") references "asset" ("id") on update cascade;
alter table "order" add constraint "order_to_asset_id_foreign" foreign key ("to_asset_id") references "asset" ("id") on update cascade;

alter table "fulfilled_order" add constraint "fulfilled_order_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;
alter table "fulfilled_order" add constraint "fulfilled_order_buy_order_id_foreign" foreign key ("buy_order_id") references "order" ("id") on update cascade;
alter table "fulfilled_order" add constraint "fulfilled_order_sell_order_id_foreign" foreign key ("sell_order_id") references "order" ("id") on update cascade;
