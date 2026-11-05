import uuid
from sqlalchemy import Column, String, Text, Float, Boolean, JSON
from backend.app.database import Base

class PricingService(Base):
    __tablename__ = "pricing_catalogue"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(50), unique=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    unit_type = Column(String(50), default="fixed") # 'fixed', 'hourly', 'per_user', 'monthly', 'milestone'
    default_rate = Column(Float, nullable=False, default=0.0)
    default_quantity = Column(Float, default=1.0)
    keywords = Column(JSON, default=list) # keywords used for automated semantic matching
    is_active = Column(Boolean, default=True)
