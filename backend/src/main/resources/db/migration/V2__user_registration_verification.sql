CREATE TABLE user_accounts (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(40) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(24) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'USER',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  email_verification_token_hash VARCHAR(64),
  email_verification_expires_at TIMESTAMPTZ,
  phone_otp_hash VARCHAR(64),
  phone_otp_expires_at TIMESTAMPTZ,
  phone_otp_attempts INTEGER NOT NULL DEFAULT 0,
  welcome_email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_accounts_role_check CHECK (role = 'USER')
);
CREATE UNIQUE INDEX ux_user_accounts_username_lower ON user_accounts (lower(username));
CREATE UNIQUE INDEX ux_user_accounts_email_lower ON user_accounts (lower(email));
CREATE UNIQUE INDEX ux_user_accounts_phone ON user_accounts (phone_number);
CREATE INDEX idx_user_accounts_email_verification_expiry ON user_accounts(email_verification_expires_at);
CREATE INDEX idx_user_accounts_phone_otp_expiry ON user_accounts(phone_otp_expires_at);
