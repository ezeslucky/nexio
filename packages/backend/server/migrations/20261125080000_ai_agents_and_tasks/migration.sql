-- CreateTable
CREATE TABLE "ai_agents" (
    "id" VARCHAR NOT NULL,
    "workspace_id" VARCHAR,
    "created_by" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "system_prompt" TEXT NOT NULL,
    "model_id" VARCHAR NOT NULL DEFAULT 'auto',
    "is_review_required" BOOLEAN NOT NULL DEFAULT false,
    "sub_agents" JSONB,
    "tools" JSONB,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ai_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_agent_tasks" (
    "id" VARCHAR NOT NULL,
    "agent_id" VARCHAR NOT NULL,
    "parent_task_id" VARCHAR,
    "user_id" VARCHAR NOT NULL,
    "workspace_id" VARCHAR,
    "status" VARCHAR NOT NULL DEFAULT 'queued',
    "input" TEXT NOT NULL,
    "context_doc_id" VARCHAR,
    "output" TEXT,
    "review_status" VARCHAR NOT NULL DEFAULT 'none',
    "review_summary" TEXT,
    "change_payload" JSONB,
    "applied_at" TIMESTAMPTZ(3),
    "sub_task_results" JSONB,
    "cost_credits" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ai_agent_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_agents_created_by_idx" ON "ai_agents"("created_by");

-- CreateIndex
CREATE INDEX "ai_agents_workspace_id_idx" ON "ai_agents"("workspace_id");

-- CreateIndex
CREATE INDEX "ai_agent_tasks_agent_id_idx" ON "ai_agent_tasks"("agent_id");

-- CreateIndex
CREATE INDEX "ai_agent_tasks_user_id_status_idx" ON "ai_agent_tasks"("user_id", "status");

-- CreateIndex
CREATE INDEX "ai_agent_tasks_parent_task_id_idx" ON "ai_agent_tasks"("parent_task_id");

-- AddForeignKey
ALTER TABLE "ai_agents" ADD CONSTRAINT "ai_agents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_agent_tasks" ADD CONSTRAINT "ai_agent_tasks_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "ai_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_agent_tasks" ADD CONSTRAINT "ai_agent_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
