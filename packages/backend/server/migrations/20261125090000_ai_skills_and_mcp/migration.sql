-- CreateTable
CREATE TABLE "ai_skills" (
    "id" VARCHAR NOT NULL,
    "user_id" VARCHAR NOT NULL,
    "workspace_id" VARCHAR,
    "name" VARCHAR NOT NULL,
    "slug" VARCHAR NOT NULL,
    "description" TEXT,
    "version" VARCHAR NOT NULL DEFAULT '1.0.0',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "frontmatter" JSONB,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ai_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_mcp_connections" (
    "id" VARCHAR NOT NULL,
    "user_id" VARCHAR NOT NULL,
    "workspace_id" VARCHAR,
    "client_name" VARCHAR NOT NULL,
    "token_hash" VARCHAR NOT NULL,
    "token_mask" VARCHAR NOT NULL,
    "permissions" JSONB NOT NULL,
    "client_ip" VARCHAR,
    "user_agent" TEXT,
    "last_used_at" TIMESTAMPTZ(3),
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ai_mcp_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_external_mcp_servers" (
    "id" VARCHAR NOT NULL,
    "user_id" VARCHAR NOT NULL,
    "workspace_id" VARCHAR,
    "name" VARCHAR NOT NULL,
    "url" VARCHAR NOT NULL,
    "transport_type" VARCHAR NOT NULL DEFAULT 'sse',
    "headers" JSONB,
    "tools" JSONB,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "require_confirmation" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ai_external_mcp_servers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_skills_user_id_slug_idx" ON "ai_skills"("user_id", "slug");
CREATE INDEX "ai_skills_workspace_id_idx" ON "ai_skills"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_mcp_connections_token_hash_key" ON "ai_mcp_connections"("token_hash");
CREATE INDEX "ai_mcp_connections_user_id_idx" ON "ai_mcp_connections"("user_id");
CREATE INDEX "ai_mcp_connections_token_hash_idx" ON "ai_mcp_connections"("token_hash");

-- CreateIndex
CREATE INDEX "ai_external_mcp_servers_user_id_idx" ON "ai_external_mcp_servers"("user_id");
CREATE INDEX "ai_external_mcp_servers_workspace_id_idx" ON "ai_external_mcp_servers"("workspace_id");

-- AddForeignKey
ALTER TABLE "ai_skills" ADD CONSTRAINT "ai_skills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_mcp_connections" ADD CONSTRAINT "ai_mcp_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_external_mcp_servers" ADD CONSTRAINT "ai_external_mcp_servers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
