import uuid
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from backend.app.models.pricing import PricingService
from backend.app.schemas.pricing import MatchedLineItem, PricingCalculationResponse

class PricingServiceManager:
    @staticmethod
    def match_and_calculate_pricing(
        db: Session,
        requirements: List[Dict[str, Any]],
        tax_percent: float = 10.0,
        discount_percent: float = 0.0,
        currency: str = "USD"
    ) -> PricingCalculationResponse:
        """
        Matches extracted customer requirements against active catalogue items.
        Deterministic backend calculation only: does not allow AI to hallucinate prices.
        Identifies unmatched items clearly as 'unmatched_custom'.
        """
        catalogue_items: List[PricingService] = db.query(PricingService).filter(PricingService.is_active == True).all()
        matched_items: List[MatchedLineItem] = []
        has_unmatched = False

        for req in requirements:
            req_name = req.get("name", "")
            req_desc = req.get("description", "")
            req_qty = float(req.get("quantity", 1.0))
            if req_qty <= 0:
                req_qty = 1.0
            
            # Combine text for matching
            target_text = f"{req_name} {req_desc}".lower()
            
            best_match: PricingService = None
            highest_score = 0

            for cat in catalogue_items:
                score = 0
                cat_name_lower = cat.name.lower()
                cat_desc_lower = (cat.description or "").lower()
                cat_keywords = [k.lower() for k in (cat.keywords or [])]

                # Exact or phrase match on name
                if cat_name_lower in target_text or any(target_text in word for word in cat_name_lower.split()):
                    score += 50
                
                # Check keywords
                for kw in cat_keywords:
                    if kw in target_text:
                        score += 20
                
                # Check description tokens
                for token in cat_desc_lower.split():
                    if len(token) > 4 and token in target_text:
                        score += 5

                if score > highest_score and score >= 20:
                    highest_score = score
                    best_match = cat

            if best_match:
                unit_price = float(best_match.default_rate)
                line_total = round(unit_price * req_qty, 2)
                matched_items.append(
                    MatchedLineItem(
                        id=str(uuid.uuid4())[:8],
                        name=best_match.name,
                        description=req_desc or best_match.description or "",
                        unit_type=best_match.unit_type,
                        quantity=req_qty,
                        unit_price=unit_price,
                        total=line_total,
                        matched_service_id=best_match.id,
                        matched_service_code=best_match.code,
                        is_custom=False,
                        confidence=min(1.0, round(highest_score / 60.0, 2)),
                        match_status="matched"
                    )
                )
            else:
                # Custom / Unmatched item requirement
                has_unmatched = True
                matched_items.append(
                    MatchedLineItem(
                        id=str(uuid.uuid4())[:8],
                        name=req_name,
                        description=f"[Uncatalogued Requirement - Requires Verification] {req_desc}",
                        unit_type="custom",
                        quantity=req_qty,
                        unit_price=0.0, # Must be priced manually by human reviewer!
                        total=0.0,
                        matched_service_id=None,
                        matched_service_code=None,
                        is_custom=True,
                        confidence=0.0,
                        match_status="unmatched_custom"
                    )
                )

        # Calculate backend totals
        subtotal = sum(item.total for item in matched_items)
        discount_amount = round(subtotal * (discount_percent / 100.0), 2)
        net_after_discount = max(0.0, subtotal - discount_amount)
        tax_amount = round(net_after_discount * (tax_percent / 100.0), 2)
        total_amount = round(net_after_discount + tax_amount, 2)

        return PricingCalculationResponse(
            items=matched_items,
            subtotal=round(subtotal, 2),
            discount_percent=discount_percent,
            tax_percent=tax_percent,
            tax_amount=tax_amount,
            total_amount=total_amount,
            currency=currency,
            has_unmatched_items=has_unmatched
        )

pricing_manager = PricingServiceManager()
