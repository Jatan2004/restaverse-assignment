from datetime import date
from pydantic import BaseModel, EmailStr, Field

class EmployeeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Full name of the employee")
    email: EmailStr = Field(..., description="Unique email address of the employee")
    department: str = Field(..., min_length=1, max_length=100, description="Department name")
    designation: str = Field(..., min_length=1, max_length=100, description="Job designation")
    date_of_joining: date = Field(..., description="Date when employee joined the company")

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeResponse(EmployeeBase):
    id: int

    # Allow compatibility with SQLAlchemy model instances (Pydantic v2 config)
    model_config = {
        "from_attributes": True
    }
