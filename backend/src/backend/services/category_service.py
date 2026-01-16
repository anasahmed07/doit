from sqlmodel import Session, select
from typing import List, Optional
import uuid
from backend.models.category import Category

class CategoryService:
    def __init__(self, session: Session):
        self.session = session

    def get_categories(self, user_id: uuid.UUID) -> List[Category]:
        statement = select(Category).where(Category.user_id == user_id)
        results = self.session.exec(statement)
        return results.all()

    def create_category(self, category: Category) -> Category:
        self.session.add(category)
        self.session.commit()
        self.session.refresh(category)
        return category

    def get_category_by_id(self, category_id: uuid.UUID) -> Optional[Category]:
        return self.session.get(Category, category_id)

    def delete_category(self, category_id: uuid.UUID):
        category = self.session.get(Category, category_id)
        if category:
            self.session.delete(category)
            self.session.commit()
