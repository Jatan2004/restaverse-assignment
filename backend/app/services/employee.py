from sqlalchemy.orm import Session
from app.repositories.employee import EmployeeRepository
from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate

class EmployeeService:
    @staticmethod
    def get_all_employees(db: Session) -> list[Employee]:
        """Business logic to fetch all employees."""
        return EmployeeRepository.get_all(db)

    @staticmethod
    def search_employees(db: Session, search_term: str) -> list[Employee]:
        """
        Business logic for searching employees.
        Performs validation checks on the search term.
        """
        # Validate that the search term is not empty or whitespace
        if not search_term or not search_term.strip():
            raise ValueError("Search term cannot be empty or whitespace.")

        # Clean the search term
        cleaned_term = search_term.strip()
        
        # Call the repository layer to fetch from the DB
        return EmployeeRepository.search(db, cleaned_term)

    @staticmethod
    def create_employee(db: Session, employee_in: EmployeeCreate) -> Employee:
        """
        Business logic to create an employee.
        Validates business rules like unique emails.
        """
        # Check if email is already taken
        existing = EmployeeRepository.get_by_email(db, employee_in.email)
        if existing:
            raise ValueError(f"An employee with email '{employee_in.email}' already exists.")
            
        return EmployeeRepository.create(db, employee_in)
