-- CreateTable
CREATE TABLE "ai_user_credit_accounts" (
    "id" VARCHAR NOT NULL,
    "user_id" VARCHAR NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 1000,
    "lifetime_used" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ai_user_credit_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_credit_transactions" (
    "id" VARCHAR NOT NULL,
    "account_id" VARCHAR NOT NULL,
    "user_id" VARCHAR NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "feature" VARCHAR NOT NULL,
    "model" VARCHAR,
    "agent_id" VARCHAR,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_credit_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_user_byok_keys" (
    "id" VARCHAR NOT NULL,
    "user_id" VARCHAR NOT NULL,
    "provider" VARCHAR NOT NULL,
    "encrypted_key" TEXT NOT NULL,
    "iv" VARCHAR NOT NULL,
    "tag" VARCHAR NOT NULL,
    "key_mask" VARCHAR NOT NULL,
    "is_valid" BOOLEAN NOT NULL DEFAULT true,
    "last_used_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ai_user_byok_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_user_credit_accounts_user_id_key" ON "ai_user_credit_accounts"("user_id");

-- CreateIndex
CREATE INDEX "ai_credit_transactions_user_id_created_at_idx" ON "ai_credit_transactions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_credit_transactions_account_id_idx" ON "ai_credit_transactions"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_user_byok_keys_user_id_provider_key" ON "ai_user_byok_keys"("user_id", "provider");

-- CreateIndex
CREATE INDEX "ai_user_byok_keys_user_id_idx" ON "ai_user_byok_keys"("user_id");

-- AddForeignKey
ALTER TABLE "ai_user_credit_accounts" ADD CONSTRAINT "ai_user_credit_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_credit_transactions" ADD CONSTRAINT "ai_credit_transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "ai_user_credit_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_user_byok_keys" ADD CONSTRAINT "ai_user_byok_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

