-- Performance Indexes for EdTech Database

-- ============================================
-- USER TABLE INDEXES
-- ============================================

-- Index for filtering users by role (used in stats queries)
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" ("role");

-- ============================================
-- COURSE TABLE INDEXES
-- ============================================

-- Index for filtering published courses (most common filter)
CREATE INDEX IF NOT EXISTS "courses_isPublished_idx" ON "courses" ("isPublished");

-- Composite index for filtering published courses ordered by creation date
-- This optimizes the most common query pattern: WHERE isPublished = true ORDER BY createdAt DESC
CREATE INDEX IF NOT EXISTS "courses_isPublished_createdAt_idx" ON "courses" ("isPublished", "createdAt" DESC);

-- Index for foreign key lookups and creator-specific queries
CREATE INDEX IF NOT EXISTS "courses_creatorId_idx" ON "courses" ("creatorId");

-- Composite index for creators filtering their own courses by published status
CREATE INDEX IF NOT EXISTS "courses_creatorId_isPublished_idx" ON "courses" ("creatorId", "isPublished");

-- Index for filtering courses by level
CREATE INDEX IF NOT EXISTS "courses_level_idx" ON "courses" ("level");

-- Index for grouping courses by category (used in stats/admin analytics)
CREATE INDEX IF NOT EXISTS "courses_category_idx" ON "courses" ("category");

-- ============================================
-- ENROLLMENT TABLE INDEXES
-- ============================================

-- Composite index for user enrollments ordered by enrollment date
-- This optimizes: WHERE userId = ? ORDER BY enrolledAt DESC
CREATE INDEX IF NOT EXISTS "enrollments_userId_enrolledAt_idx" ON "enrollments" ("userId", "enrolledAt" DESC);

-- Index for course enrollment lookups (foreign key optimization)
CREATE INDEX IF NOT EXISTS "enrollments_courseId_idx" ON "enrollments" ("courseId");

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Uncomment to verify indexes were created:
-- SELECT 
--     schemaname,
--     tablename,
--     indexname,
--     indexdef
-- FROM pg_indexes
-- WHERE tablename IN ('users', 'courses', 'enrollments')
-- ORDER BY tablename, indexname;

