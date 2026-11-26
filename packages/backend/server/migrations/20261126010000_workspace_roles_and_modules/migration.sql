-- CreateTable workspace_module_settings
CREATE TABLE IF NOT EXISTS "workspace_module_settings" (
    "id" VARCHAR NOT NULL,
    "workspace_id" VARCHAR NOT NULL,
    "enable_tracker" BOOLEAN NOT NULL DEFAULT true,
    "enable_chat" BOOLEAN NOT NULL DEFAULT true,
    "enable_docs" BOOLEAN NOT NULL DEFAULT true,
    "enable_office" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_module_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "workspace_module_settings_workspace_id_key" ON "workspace_module_settings"("workspace_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "workspace_module_settings_workspace_id_idx" ON "workspace_module_settings"("workspace_id");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'workspace_module_settings_workspace_id_fkey'
    ) THEN
        ALTER TABLE "workspace_module_settings" ADD CONSTRAINT "workspace_module_settings_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
