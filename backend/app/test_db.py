from sqlalchemy import text
from app.database import engine

print("Testing database connection...")

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))
        print("✅ Connected to PostgreSQL!")
        print(result.fetchone())
except Exception as e:
    print("❌ Connection failed!")
    print(e)