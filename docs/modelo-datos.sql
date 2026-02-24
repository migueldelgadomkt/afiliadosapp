-- Esquema inicial sugerido (PostgreSQL)

create table users (
  id bigserial primary key,
  email text unique not null,
  password_hash text not null,
  role text not null check (role in ('admin','provider')),
  full_name text not null,
  provider_id bigint,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table providers (
  id bigserial primary key,
  business_name text not null,
  logo_url text,
  contact_name text,
  contact_phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table users
  add constraint fk_users_provider
  foreign key (provider_id) references providers(id);

create table credit_movements (
  id bigserial primary key,
  provider_id bigint not null references providers(id),
  movement_type text not null check (movement_type in ('recarga','ajuste_manual','consumo','devolucion')),
  amount integer not null,
  reason text,
  album_request_id bigint,
  created_by bigint references users(id),
  created_at timestamptz not null default now()
);

create table album_requests (
  id bigserial primary key,
  provider_id bigint not null references providers(id),
  event_name text not null,
  album_qty integer not null check (album_qty > 0),
  status text not null check (status in ('solicitud','en_proceso','entregado')) default 'solicitud',
  required_date date,
  notes text,
  created_by bigint not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table credit_movements
  add constraint fk_credit_album_request
  foreign key (album_request_id) references album_requests(id);

create table request_status_history (
  id bigserial primary key,
  album_request_id bigint not null references album_requests(id),
  old_status text,
  new_status text not null,
  changed_by bigint not null references users(id),
  changed_at timestamptz not null default now()
);

create table event_links (
  id bigserial primary key,
  provider_id bigint not null references providers(id),
  event_name text not null,
  token text unique not null,
  brand_name text not null,
  brand_logo_url text,
  is_active boolean not null default true,
  created_by bigint not null references users(id),
  created_at timestamptz not null default now()
);

create table public_form_submissions (
  id bigserial primary key,
  event_link_id bigint not null references event_links(id),
  client_name text not null,
  client_phone text,
  client_email text,
  album_qty integer not null check (album_qty > 0),
  payload jsonb,
  created_at timestamptz not null default now()
);

create table credit_recharge_requests (
  id bigserial primary key,
  provider_id bigint not null references providers(id),
  requested_credits integer not null check (requested_credits > 0),
  status text not null check (status in ('pendiente','aprobada','rechazada')) default 'pendiente',
  notes text,
  requested_by bigint not null references users(id),
  resolved_by bigint references users(id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table audit_logs (
  id bigserial primary key,
  actor_user_id bigint references users(id),
  action text not null,
  target_type text,
  target_id bigint,
  metadata jsonb,
  created_at timestamptz not null default now()
);
