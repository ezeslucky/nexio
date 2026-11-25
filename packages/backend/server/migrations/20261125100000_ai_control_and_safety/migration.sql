-- CreateTable
CREATE TABLE "ai_spending_limits" (
    "id" VARCHAR NOT NULL,
    "user_id" VARCHAR NOT NULL,
    "workspace_id" VARCHAR,
    "monthly_credit_limit" INTEGER NOT NULL DEFAULT 5000,
    "daily_credit_limit" INTEGER NOT NULL DEFAULT 1000,
    "alert_threshold_percent" INTEGER NOT NULL DEFAULT 80,
    "current_month_usage" INTEGER NOT NULL DEFAULT 0,
    "current_day_usage" INTEGER NOT NULL DEFAULT 0,
    "alert_triggered" BOOLEAN NOT NULL DEFAULT false,
    "hard_limit_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ai_spending_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_policy_controls" (
    "id" VARCHAR NOT NULL,
    "workspace_id" VARCHAR NOT NULL,
    "allowed_models" JSONB NOT NULL,
    "allowed_agents" JSONB NOT NULL,
    "max_credit_per_request" INTEGER NOT NULL DEFAULT 100,
    "require_approval_for_agents" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ai_policy_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_document_change_histories" (
    "id" VARCHAR NOT NULL,
    "doc_id" VARCHAR NOT NULL,
    "workspace_id" VARCHAR,
    "user_id" VARCHAR NOT NULL,
    "author_type" VARCHAR NOT NULL,
    "author_id" VARCHAR NOT NULL,
    "author_name" VARCHAR NOT NULL,
    "change_summary" TEXT NOT NULL,
    "diff_data" JSONB,
    "previous_snapshot" TEXT,
    "current_snapshot" TEXT NOT NULL,
    "is_restored" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ai_document_change_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_database_column_permissions" (
    "id" VARCHAR NOT NULL,
    "database_id" VARCHAR NOT NULL,
    "property_id" VARCHAR NOT NULL,
    "property_name" VARCHAR NOT NULL,
    "workspace_id" VARCHAR,
    "created_by" VARCHAR NOT NULL,
    "allowed_roles" JSONB NOT NULL,
    "allowed_agents" JSONB NOT NULL,
    "allowed_users" JSONB,
    "can_view" BOOLEAN NOT NULL DEFAULT true,
    "can_edit" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ai_database_column_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_spending_limits_user_id_workspace_id_key" ON "ai_spending_limits"("user_id", "workspace_id");
CREATE INDEX "ai_spending_limits_user_id_idx" ON "ai_spending_limits"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_policy_controls_workspace_id_key" ON "ai_policy_controls"("workspace_id");

-- CreateIndex
CREATE INDEX "ai_document_change_histories_doc_id_idx" ON "ai_document_change_histories"("doc_id");
CREATE INDEX "ai_document_change_histories_user_id_idx" ON "ai_document_change_histories"("user_id");

-- CreateIndex
CREATE INDEX "ai_database_column_permissions_database_id_property_id_idx" ON "ai_database_column_permissions"("database_id", "property_id");
CREATE INDEX "ai_database_column_permissions_created_by_idx" ON "ai_database_column_permissions"("created_by");

-- AddForeignKey
ALTER TABLE "ai_spending_limits" ADD CONSTRAINT "ai_spending_limits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_document_change_histories" ADD CONSTRAINT "ai_document_change_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_database_column_permissions" ADD CONSTRAINT "ai_database_column_permissions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
