from sqlalchemy import Column, Integer, String, Date, Index
from app.database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    department = Column(String(100), nullable=False)
    designation = Column(String(100), nullable=False)
    date_of_joining = Column(Date, nullable=False)

    # Indexes are critical for search optimization.
    # We add single-column indexes on name and department to optimize matching queries.
    __table_args__ = (
        Index("idx_employee_name", "name"),
        Index("idx_employee_department", "department"),
    )

    def __repr__(self):
        return f"<Employee(id={self.id}, name='{self.name}', department='{self.department}')>"
