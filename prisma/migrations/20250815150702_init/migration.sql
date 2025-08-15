-- CreateIndex
CREATE INDEX "idx_follows_follower_id" ON "public"."follows"("follower_id");

-- CreateIndex
CREATE INDEX "idx_follows_following_id" ON "public"."follows"("following_id");

-- CreateIndex
CREATE INDEX "idx_follows_created_at" ON "public"."follows"("created_at");

-- CreateIndex
CREATE INDEX "idx_poll_votes_poll_id" ON "public"."poll_votes"("poll_id");

-- CreateIndex
CREATE INDEX "idx_poll_votes_user_id" ON "public"."poll_votes"("user_id");

-- CreateIndex
CREATE INDEX "idx_poll_votes_created_at" ON "public"."poll_votes"("created_at");

-- CreateIndex
CREATE INDEX "idx_polls_post_id" ON "public"."polls"("post_id");

-- CreateIndex
CREATE INDEX "idx_polls_user_id" ON "public"."polls"("user_id");

-- CreateIndex
CREATE INDEX "idx_polls_created_at" ON "public"."polls"("created_at");

-- CreateIndex
CREATE INDEX "idx_polls_expires_at" ON "public"."polls"("expires_at");

-- CreateIndex
CREATE INDEX "idx_users_created_at" ON "public"."users"("created_at");

-- CreateIndex
CREATE INDEX "idx_users_username" ON "public"."users"("username");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "public"."users"("email");
