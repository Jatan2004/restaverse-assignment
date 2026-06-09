from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError, SQLAlchemyError
import logging

from app.database import get_db
from app.schemas.employee import EmployeeResponse, EmployeeCreate
from app.services.employee import EmployeeService

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/employees/all", response_model=list[EmployeeResponse])
def get_all_employees(db: Session = Depends(get_db)):
    """
    Retrieve all employees (up to a limit of 50).
    Enables frontend to populate the directory by default on page load.
    """
    try:
        employees = EmployeeService.get_all_employees(db)
        return employees
    except OperationalError as op_err:
        logger.error(f"Database connection failure during get_all: {str(op_err)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection failure. Please ensure the database server is running."
        )
    except SQLAlchemyError as db_err:
        logger.error(f"Database error during get_all: {str(db_err)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A database error occurred. Please try again later."
        )

@router.get("/employees", response_model=list[EmployeeResponse])
def get_employees(
    search: str = Query(None, description="Search term for employee name or department"),
    db: Session = Depends(get_db)
):
    """
    Search employees by name or department.
    Handles validation errors and database connection failures gracefully.
    """
    # 1. Validation & Error Handling: Empty search query check
    # If search parameter is not provided or is empty
    if search is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query parameter 'search' is required."
        )
        
    if not search.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query cannot be empty or contain only whitespace."
        )

    try:
        # Call the business logic layer
        employees = EmployeeService.search_employees(db, search)
        return employees

    except ValueError as val_err:
        # Handle business logic validation failures
        logger.warning(f"Validation failure in employee search: {str(val_err)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )

    except OperationalError as op_err:
        # Handle database connection issues specifically
        logger.error(f"Database connection failure during search: {str(op_err)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection failure. Please ensure the database server is running and configured correctly."
        )

    except SQLAlchemyError as db_err:
        # Handle other database related issues
        logger.error(f"Database error during search: {str(db_err)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected database error occurred. Please try again later."
        )


@router.post("/employees", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    employee_in: EmployeeCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new employee record.
    This demonstrates clean architecture extensibility (Backend Task 4).
    """
    try:
        new_employee = EmployeeService.create_employee(db, employee_in)
        return new_employee

    except ValueError as val_err:
        logger.warning(f"Validation failure in employee creation: {str(val_err)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )

    except OperationalError as op_err:
        logger.error(f"Database connection failure during creation: {str(op_err)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection failure. Please ensure the database server is running."
        )

    except SQLAlchemyError as db_err:
        logger.error(f"Database error during creation: {str(db_err)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A database error occurred while creating the employee."
        )
