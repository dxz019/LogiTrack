-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users (customers, drivers, admins)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT CHECK (role IN ('customer','driver','admin')) DEFAULT 'customer',
  phone         TEXT,
  fcm_token     TEXT,             -- Firebase push token
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Driver profiles
CREATE TABLE drivers (
  id              UUID PRIMARY KEY REFERENCES users(id),
  vehicle_type    TEXT CHECK (vehicle_type IN ('bike','car','van','truck')),
  vehicle_number  TEXT,
  license_number  TEXT,
  vehicle_registration TEXT,
  aadhar_card     TEXT,
  address         TEXT,
  is_available    BOOLEAN DEFAULT false,
  is_online       BOOLEAN DEFAULT false,
  current_location GEOMETRY(Point, 4326),  -- PostGIS live location
  zone            TEXT,
  acceptance_rate NUMERIC(5,2) DEFAULT 100.00,
  rating          NUMERIC(3,2) DEFAULT 5.00,
  total_deliveries INT DEFAULT 0,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID REFERENCES users(id),
  driver_id       UUID REFERENCES drivers(id),
  status          TEXT CHECK (status IN (
                    'pending','assigned','accepted',
                    'picked_up','in_transit','delivered','cancelled'
                  )) DEFAULT 'pending',
  pickup_address  TEXT NOT NULL,
  pickup_location GEOMETRY(Point, 4326),
  delivery_address TEXT NOT NULL,
  delivery_location GEOMETRY(Point, 4326),
  package_description TEXT,
  estimated_distance  NUMERIC(8,2),   -- km
  estimated_duration  INT,            -- minutes
  eta             TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  delivery_proof_url TEXT,            -- photo on delivery
  priority        TEXT CHECK (priority IN ('normal','express','urgent')) DEFAULT 'normal',
  price           NUMERIC(10,2),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Live GPS tracking log
CREATE TABLE tracking_logs (
  id          BIGSERIAL PRIMARY KEY,
  order_id    UUID REFERENCES orders(id),
  driver_id   UUID REFERENCES drivers(id),
  location    GEOMETRY(Point, 4326),
  speed       NUMERIC(6,2),           -- km/h
  heading     NUMERIC(6,2),           -- degrees
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_tracking_order ON tracking_logs(order_id, recorded_at DESC);

-- Notifications
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  order_id    UUID REFERENCES orders(id),
  type        TEXT,   -- 'order_assigned', 'picked_up', 'delivered' etc
  title       TEXT,
  message     TEXT,
  is_read     BOOLEAN DEFAULT false,
  sent_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Demand zones for forecasting
CREATE TABLE demand_zones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name   TEXT,
  boundary    GEOMETRY(Polygon, 4326),
  avg_orders_per_hour NUMERIC(6,2),
  peak_hours  INT[],
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);