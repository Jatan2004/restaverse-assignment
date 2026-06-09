from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate

class EmployeeRepository:
    @staticmethod
    def get_by_id(db: Session, employee_id: int) -> Employee:
        """Fetch employee by their unique ID."""
        return db.query(Employee).filter(Employee.id == employee_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Employee:
        """Fetch employee by their unique email."""
        return db.query(Employee).filter(Employee.email == email).first()

    @staticmethod
    def get_all(db: Session, limit: int = 100) -> list[Employee]:
        """Fetch all employees up to a limit. Returns newest first."""
        return db.query(Employee).order_by(Employee.id.desc()).limit(limit).all()

    @staticmethod
    def search(db: Session, search_term: str, limit: int = 100) -> list[Employee]:
        """
        Search employees by name or department using indexed fields.
        Applies a limit to prevent fetching excessive amounts of data.
        """
        # Case insensitive prefix matching on name or department.
        # B-tree indexes are optimized for prefix matching (term%), so we anchor
        # the search term to leverage the indexes idx_employee_name and idx_employee_department.
        return db.query(Employee).filter(
            or_(
                Employee.name.like(f"{search_term}%"),
                Employee.department.like(f"{search_term}%")
            )
        ).order_by(Employee.id.desc()).limit(limit).all()

    @staticmethod
    def create(db: Session, employee_in: EmployeeCreate) -> Employee:
        """Create a new employee record. Makes the repository extensible."""
        db_employee = Employee(
            name=employee_in.name,
            email=employee_in.email,
            department=employee_in.department,
            designation=employee_in.designation,
            date_of_joining=employee_in.date_of_joining
        )
        db.add(db_employee)
        db.commit()
        db.refresh(db_employee)
        return db_employee
