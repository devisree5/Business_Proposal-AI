from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.models.pricing import PricingService
from backend.app.models.activity import ActivityLog
from backend.app.schemas.pricing import (
    PricingServiceResponse,
    PricingServiceCreate,
    PricingServiceUpdate,
    MatchRequirementsRequest,
    PricingCalculationResponse
)
from backend.app.services.pricing_service import pricing_manager

router = APIRouter(prefix="/api/pricing", tags=["Pricing"])

@router.get("", response_model=List[PricingServiceResponse])
def get_pricing_catalogue(db: Session = Depends(get_db)):
    return db.query(PricingService).all()

@router.post("", response_model=PricingServiceResponse)
def create_pricing_service(payload: PricingServiceCreate, db: Session = Depends(get_db)):
    existing = db.query(PricingService).filter(PricingService.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="A service with this code already exists in catalogue")
    
    item = PricingService(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/{service_id}", response_model=PricingServiceResponse)
def update_pricing_service(service_id: str, payload: PricingServiceUpdate, db: Session = Depends(get_db)):
    item = db.query(PricingService).filter(PricingService.id == service_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Catalogue service not found")
    
    for key, val in payload.model_dump(exclude_unset=True).items():
        setattr(item, key, val)
    
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{service_id}")
def delete_pricing_service(service_id: str, db: Session = Depends(get_db)):
    item = db.query(PricingService).filter(PricingService.id == service_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Service not found")
    db.delete(item)
    db.commit()
    return {"success": True, "message": "Service removed from catalogue"}

@router.post("/match", response_model=PricingCalculationResponse)
def match_requirements_pricing(payload: MatchRequirementsRequest, db: Session = Depends(get_db)):
    """
    Matches extracted requirements against catalogue items in INR.
    Calculates subtotal, 18% GST (CGST/SGST/IGST), and total.
    """
    req_dicts = [
        {
            "name": r.requirement_name,
            "description": r.description,
            "quantity": r.quantity,
            "unit": r.unit
        }
        for r in payload.requirements
    ]
    calc = pricing_manager.match_and_calculate_pricing(
        db,
        requirements=req_dicts,
        gst_rate=payload.gst_rate or 18.0,
        is_interstate=payload.is_interstate or False
    )
    
    db.add(ActivityLog(
        action_type="pricing_calculated",
        title=f"Pricing calculated: ₹{calc.total_amount:,.2f} INR",
        description=f"Matched {len(calc.items)} items with 18% GST",
        reference_id=None
    ))
    db.commit()
    
    return calc
