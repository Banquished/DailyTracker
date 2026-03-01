"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-03-01 00:00:00.000000

"""
import sqlalchemy as sa

from alembic import op

revision: str = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Use raw SQL throughout.
    #
    # op.create_table() fires SQLAlchemy's _on_table_create event for every
    # Enum column, which calls CREATE TYPE regardless of create_type=False.
    # Raw SQL bypasses the entire SQLAlchemy type-event system.

    # ------------------------------------------------------------------
    # Enum types (DO blocks are idempotent against crash-resume scenarios)
    # ------------------------------------------------------------------
    op.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE recurrencetype AS ENUM ('none', 'daily', 'weekly', 'monthly');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$
    """))
    op.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE habittype AS ENUM ('binary', 'count');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$
    """))
    op.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE habitrecurrence AS ENUM ('daily', 'weekly', 'monthly');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$
    """))
    op.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE mealslot AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$
    """))

    # ------------------------------------------------------------------
    # Tables (IF NOT EXISTS for idempotency; FK order matters)
    # ------------------------------------------------------------------
    op.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS users (
            id          UUID        NOT NULL PRIMARY KEY,
            email       TEXT        NOT NULL,
            hashed_password TEXT    NOT NULL,
            name        TEXT        NOT NULL,
            created_at  TIMESTAMPTZ NOT NULL
        )
    """))
    op.execute(sa.text(
        "CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email)"
    ))

    op.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS todos (
            id          UUID            NOT NULL PRIMARY KEY,
            user_id     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title       TEXT            NOT NULL,
            description TEXT,
            recurrence  recurrencetype  NOT NULL DEFAULT 'none',
            rollover    BOOLEAN         NOT NULL DEFAULT false,
            active      BOOLEAN         NOT NULL DEFAULT true,
            created_at  TIMESTAMPTZ     NOT NULL
        )
    """))
    op.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_todos_user_id ON todos (user_id)"
    ))

    op.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS todo_occurrences (
            id           UUID        NOT NULL PRIMARY KEY,
            todo_id      UUID        NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
            due_date     DATE        NOT NULL,
            completed_at TIMESTAMPTZ,
            missed       BOOLEAN     NOT NULL DEFAULT false
        )
    """))
    op.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_todo_occurrences_todo_id ON todo_occurrences (todo_id)"
    ))

    op.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS habits (
            id           UUID            NOT NULL PRIMARY KEY,
            user_id      UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name         TEXT            NOT NULL,
            type         habittype       NOT NULL DEFAULT 'binary',
            target_count INTEGER,
            recurrence   habitrecurrence NOT NULL DEFAULT 'daily',
            color        TEXT            NOT NULL DEFAULT '#2563eb',
            active       BOOLEAN         NOT NULL DEFAULT true,
            created_at   TIMESTAMPTZ     NOT NULL
        )
    """))
    op.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_habits_user_id ON habits (user_id)"
    ))

    op.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS habit_logs (
            id        UUID    NOT NULL PRIMARY KEY,
            habit_id  UUID    NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
            date      DATE    NOT NULL,
            completed BOOLEAN NOT NULL DEFAULT true,
            count     INTEGER
        )
    """))
    op.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_habit_logs_habit_id ON habit_logs (habit_id)"
    ))

    op.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS weight_entries (
            id        UUID          NOT NULL PRIMARY KEY,
            user_id   UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            date      DATE          NOT NULL,
            weight_kg NUMERIC(5, 2) NOT NULL
        )
    """))
    op.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_weight_entries_user_id ON weight_entries (user_id)"
    ))
    op.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_weight_entries_date ON weight_entries (date)"
    ))

    op.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS macro_profiles (
            id        UUID        NOT NULL PRIMARY KEY,
            user_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            calories  INTEGER     NOT NULL DEFAULT 2000,
            protein_g INTEGER     NOT NULL DEFAULT 150,
            carbs_g   INTEGER     NOT NULL DEFAULT 200,
            fat_g     INTEGER     NOT NULL DEFAULT 65,
            updated_at TIMESTAMPTZ NOT NULL,
            CONSTRAINT uq_macro_profiles_user_id UNIQUE (user_id)
        )
    """))
    op.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_macro_profiles_user_id ON macro_profiles (user_id)"
    ))

    op.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS foods (
            id               UUID          NOT NULL PRIMARY KEY,
            user_id          UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name             TEXT          NOT NULL,
            calories_per_100g NUMERIC(6, 2) NOT NULL,
            protein_g        NUMERIC(5, 2) NOT NULL,
            carbs_g          NUMERIC(5, 2) NOT NULL,
            fat_g            NUMERIC(5, 2) NOT NULL
        )
    """))
    op.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_foods_user_id ON foods (user_id)"
    ))
    op.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_foods_name ON foods (name)"
    ))

    op.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS meal_plan_entries (
            id        UUID          NOT NULL PRIMARY KEY,
            user_id   UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            date      DATE          NOT NULL,
            meal_slot mealslot      NOT NULL,
            food_id   UUID          NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
            grams     NUMERIC(6, 1) NOT NULL,
            notes     TEXT
        )
    """))
    op.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_meal_plan_entries_user_id ON meal_plan_entries (user_id)"
    ))
    op.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_meal_plan_entries_date ON meal_plan_entries (date)"
    ))


def downgrade() -> None:
    op.execute(sa.text("DROP TABLE IF EXISTS meal_plan_entries"))
    op.execute(sa.text("DROP TABLE IF EXISTS foods"))
    op.execute(sa.text("DROP TABLE IF EXISTS macro_profiles"))
    op.execute(sa.text("DROP TABLE IF EXISTS weight_entries"))
    op.execute(sa.text("DROP TABLE IF EXISTS habit_logs"))
    op.execute(sa.text("DROP TABLE IF EXISTS habits"))
    op.execute(sa.text("DROP TABLE IF EXISTS todo_occurrences"))
    op.execute(sa.text("DROP TABLE IF EXISTS todos"))
    op.execute(sa.text("DROP TABLE IF EXISTS users"))
    op.execute(sa.text("DROP TYPE IF EXISTS mealslot"))
    op.execute(sa.text("DROP TYPE IF EXISTS habitrecurrence"))
    op.execute(sa.text("DROP TYPE IF EXISTS habittype"))
    op.execute(sa.text("DROP TYPE IF EXISTS recurrencetype"))
