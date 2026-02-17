from typing import List, Dict
import uuid
from datetime import datetime, timezone

class WorkerLogicService:
    @staticmethod
    def calculate_badges(worker_stats: Dict) -> List[Dict]:
        """Calcule les badges basés sur les statistiques du worker"""
        badges = []
        total_shifts = worker_stats.get("total_shifts_completed", 0)
        rating = worker_stats.get("rating", 5.0)
        
        if total_shifts >= 1:
            badges.append({"id": "first_shift", "label": "Premier Shift", "icon": "🎯", "color": "blue"})
        if total_shifts >= 10:
            badges.append({"id": "expert", "label": "Expert (10+)", "icon": "🏆", "color": "gold"})
        if rating >= 4.8 and total_shifts >= 5:
            badges.append({"id": "top_rated", "label": "Top Rated", "icon": "⭐", "color": "emerald"})
        
        return badges

    @staticmethod
    def calculate_matching_score(worker: Dict, shift: Dict) -> float:
        """Calcule un score de matching entre un worker et un shift (0 à 100)"""
        score = 0
        
        # 1. Matching par métier (40 points)
        worker_skills = worker.get("skills", [])
        if shift.get("service_type") in worker_skills:
            score += 40
            
        # 2. Note du worker (30 points)
        rating = worker.get("rating", 5.0)
        score += (rating / 5.0) * 30
        
        # 3. Expérience (20 points)
        exp = worker.get("experience_years", 0)
        score += min(exp * 4, 20)
        
        # 4. Complétion du profil (10 points)
        if worker.get("verification_status") == "verified":
            score += 10
            
        return round(score, 1)

worker_logic = WorkerLogicService()
