import os
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.config import settings

# Database URL adjustment for Render / PostgreSQL if 'postgres://' is used
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# SQLite-specific connect args
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def run_auto_migrations(target_engine):
    """
    Safely adds missing columns to existing SQLite / Postgres tables when schema evolves
    without requiring manual migration scripts or dropping user data.
    """
    try:
        inspector = inspect(target_engine)
        table_names = inspector.get_table_names()

        # Expected new columns: (table_name, column_name, sql_type_and_default)
        migrations = [
            # emails table
            ("emails", "thread_id", "VARCHAR(255)"),
            ("emails", "recipient_email", "VARCHAR(255) DEFAULT 'anyaforgerrrr345@gmail.com'"),
            ("emails", "lead_priority", "VARCHAR(50) DEFAULT 'High'"),
            ("emails", "priority_rationale", "TEXT"),
            # proposals table
            ("proposals", "version", "INTEGER DEFAULT 1"),
            ("proposals", "parent_proposal_id", "VARCHAR(50)"),
            ("proposals", "gst_rate", "FLOAT DEFAULT 18.0"),
            ("proposals", "is_interstate", "BOOLEAN DEFAULT 0"),
            ("proposals", "cgst_amount", "FLOAT DEFAULT 0.0"),
            ("proposals", "sgst_amount", "FLOAT DEFAULT 0.0"),
            ("proposals", "igst_amount", "FLOAT DEFAULT 0.0"),
            ("proposals", "client_gstin", "VARCHAR(50)"),
            ("proposals", "sender_gstin", "VARCHAR(50) DEFAULT '36AAACN1234F1Z5'"),
            ("proposals", "sender_pan", "VARCHAR(50) DEFAULT 'AAACN1234F'"),
            ("proposals", "bank_name", "VARCHAR(100) DEFAULT 'HDFC Bank Ltd.'"),
            ("proposals", "bank_account", "VARCHAR(50) DEFAULT '50200012345678'"),
            ("proposals", "bank_ifsc", "VARCHAR(20) DEFAULT 'HDFC0001234'"),
            ("proposals", "bank_branch", "VARCHAR(100) DEFAULT 'Madhapur Branch, Hyderabad'"),
            ("proposals", "follow_up_due_date", "DATETIME"),
            ("proposals", "follow_up_status", "VARCHAR(50) DEFAULT 'none'"),
            ("proposals", "follow_up_notes", "TEXT"),
        ]

        with target_engine.connect() as conn:
            for table, col, col_def in migrations:
                if table in table_names:
                    existing_cols = [c["name"] for c in inspector.get_columns(table)]
                    if col not in existing_cols:
                        conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_def}"))
            conn.commit()
    except Exception as e:
        print(f"[AutoMigrate Notice]: {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
