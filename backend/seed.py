import sys
from datetime import date
from sqlalchemy import inspect
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError

# Add the parent directory to python path to import app modules correctly
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models.employee import Employee

# Rich list of realistic mock employee data (50+ records)
MOCK_EMPLOYEES = [
    {"name": "Rahul Sharma", "email": "rahul.sharma@company.com", "department": "Engineering", "designation": "Senior Software Engineer", "date_of_joining": date(2021, 3, 15)},
    {"name": "Ananya Patel", "email": "ananya.patel@company.com", "department": "Engineering", "designation": "Frontend Developer", "date_of_joining": date(2022, 6, 1)},
    {"name": "Rajesh Kumar", "email": "rajesh.kumar@company.com", "department": "Engineering", "designation": "Backend Tech Lead", "date_of_joining": date(2020, 1, 10)},
    {"name": "Priya Singh", "email": "priya.singh@company.com", "department": "Human Resources", "designation": "HR Manager", "date_of_joining": date(2019, 8, 24)},
    {"name": "Amit Verma", "email": "amit.verma@company.com", "department": "Marketing", "designation": "Digital Marketer", "date_of_joining": date(2023, 2, 18)},
    {"name": "Vikram Malhotra", "email": "vikram.malhotra@company.com", "department": "Finance", "designation": "Financial Analyst", "date_of_joining": date(2021, 11, 5)},
    {"name": "Sanjay Gupta", "email": "sanjay.gupta@company.com", "department": "Operations", "designation": "Operations Director", "date_of_joining": date(2018, 5, 12)},
    {"name": "Sneha Reddy", "email": "sneha.reddy@company.com", "department": "Sales", "designation": "Account Executive", "date_of_joining": date(2022, 9, 30)},
    {"name": "Rahul Verma", "email": "rahul.verma@company.com", "department": "Marketing", "designation": "Marketing Lead", "date_of_joining": date(2022, 4, 15)},
    {"name": "Neha Joshi", "email": "neha.joshi@company.com", "department": "Engineering", "designation": "QA Engineer", "date_of_joining": date(2023, 5, 20)},
    {"name": "David Miller", "email": "david.miller@company.com", "department": "Engineering", "designation": "DevOps Specialist", "date_of_joining": date(2021, 7, 1)},
    {"name": "Sarah Connor", "email": "sarah.connor@company.com", "department": "Operations", "designation": "Security Specialist", "date_of_joining": date(2019, 10, 14)},
    {"name": "John Doe", "email": "john.doe@company.com", "department": "Sales", "designation": "Sales Manager", "date_of_joining": date(2020, 3, 25)},
    {"name": "Jane Smith", "email": "jane.smith@company.com", "department": "Engineering", "designation": "Software Engineer II", "date_of_joining": date(2022, 1, 15)},
    {"name": "Rahul Nair", "email": "rahul.nair@company.com", "department": "Engineering", "designation": "Engineering Manager", "date_of_joining": date(2017, 12, 1)},
    {"name": "Karan Johar", "email": "karan.johar@company.com", "department": "Marketing", "designation": "Content Strategist", "date_of_joining": date(2023, 7, 19)},
    {"name": "Divya Rao", "email": "divya.rao@company.com", "department": "Human Resources", "designation": "Recruiter", "date_of_joining": date(2021, 10, 10)},
    {"name": "Arjun Kapoor", "email": "arjun.kapoor@company.com", "department": "Finance", "designation": "Senior Accountant", "date_of_joining": date(2020, 11, 30)},
    {"name": "Ishita Bhalla", "email": "ishita.bhalla@company.com", "department": "Operations", "designation": "Operations Coordinator", "date_of_joining": date(2023, 1, 5)},
    {"name": "Rohan Mehra", "email": "rohan.mehra@company.com", "department": "Sales", "designation": "Inside Sales Associate", "date_of_joining": date(2023, 9, 1)},
    {"name": "Kunal Sen", "email": "kunal.sen@company.com", "department": "Engineering", "designation": "Frontend Architect", "date_of_joining": date(2018, 9, 15)},
    {"name": "Pooja Banerjee", "email": "pooja.banerjee@company.com", "department": "Engineering", "designation": "Data Scientist", "date_of_joining": date(2020, 6, 20)},
    {"name": "Aditya Roy", "email": "aditya.roy@company.com", "department": "Marketing", "designation": "SEO Specialist", "date_of_joining": date(2022, 8, 14)},
    {"name": "Shruti Iyer", "email": "shruti.iyer@company.com", "department": "Human Resources", "designation": "HR Assistant", "date_of_joining": date(2023, 11, 1)},
    {"name": "Manish Paul", "email": "manish.paul@company.com", "department": "Finance", "designation": "Payroll Specialist", "date_of_joining": date(2021, 2, 28)},
    {"name": "Vijay Sethupathi", "email": "vijay.sethupathi@company.com", "department": "Operations", "designation": "Logistics Manager", "date_of_joining": date(2019, 4, 18)},
    {"name": "Samantha Ruth", "email": "samantha.ruth@company.com", "department": "Sales", "designation": "Business Development Rep", "date_of_joining": date(2022, 10, 5)},
    {"name": "Rahul Deshmukh", "email": "rahul.deshmukh@company.com", "department": "Finance", "designation": "Finance VP", "date_of_joining": date(2015, 6, 25)},
    {"name": "Ravi Shastri", "email": "ravi.shastri@company.com", "department": "Operations", "designation": "Facility Manager", "date_of_joining": date(2017, 3, 14)},
    {"name": "Kriti Sanon", "email": "kriti.sanon@company.com", "department": "Marketing", "designation": "Brand Manager", "date_of_joining": date(2021, 5, 20)},
    {"name": "Varun Dhawan", "email": "varun.dhawan@company.com", "department": "Sales", "designation": "Sales Executive", "date_of_joining": date(2022, 2, 1)},
    {"name": "Alia Bhatt", "email": "alia.bhatt@company.com", "department": "Engineering", "designation": "UX Designer", "date_of_joining": date(2021, 10, 1)},
    {"name": "Ranbir Kapoor", "email": "ranbir.kapoor@company.com", "department": "Engineering", "designation": "Product Manager", "date_of_joining": date(2020, 8, 15)},
    {"name": "Sidharth Malhotra", "email": "sidharth.malhotra@company.com", "department": "Engineering", "designation": "Mobile Engineer", "date_of_joining": date(2022, 7, 10)},
    {"name": "Kiara Advani", "email": "kiara.advani@company.com", "department": "Human Resources", "designation": "Talent Acquisition Lead", "date_of_joining": date(2020, 12, 1)},
    {"name": "Deepika Padukone", "email": "deepika.padukone@company.com", "department": "Marketing", "designation": "PR Director", "date_of_joining": date(2018, 11, 20)},
    {"name": "Ranveer Singh", "email": "ranveer.singh@company.com", "department": "Sales", "designation": "Sales Director", "date_of_joining": date(2017, 7, 5)},
    {"name": "Katrina Kaif", "email": "katrina.kaif@company.com", "department": "Finance", "designation": "Internal Auditor", "date_of_joining": date(2020, 4, 18)},
    {"name": "Vicky Kaushal", "email": "vicky.kaushal@company.com", "department": "Operations", "designation": "Supply Chain Planner", "date_of_joining": date(2021, 9, 22)},
    {"name": "Ayushmann Khurrana", "email": "ayushmann.khurrana@company.com", "department": "Marketing", "designation": "Copywriter", "date_of_joining": date(2022, 12, 1)},
    {"name": "Rajkummar Rao", "email": "rajkummar.rao@company.com", "department": "Engineering", "designation": "Systems Architect", "date_of_joining": date(2019, 2, 14)},
    {"name": "Bhumi Pednekar", "email": "bhumi.pednekar@company.com", "department": "Human Resources", "designation": "HR Generalist", "date_of_joining": date(2023, 4, 1)},
    {"name": "Kartik Aaryan", "email": "kartik.aaryan@company.com", "department": "Sales", "designation": "Customer Success Manager", "date_of_joining": date(2023, 8, 20)},
    {"name": "Sara Ali Khan", "email": "sara.alikhan@company.com", "department": "Engineering", "designation": "Data Analyst", "date_of_joining": date(2022, 5, 15)},
    {"name": "Janhvi Kapoor", "email": "janhvi.kapoor@company.com", "department": "Marketing", "designation": "Social Media Associate", "date_of_joining": date(2023, 6, 10)},
    {"name": "Ishaan Khatter", "email": "ishaan.khatter@company.com", "department": "Engineering", "designation": "Junior Web Developer", "date_of_joining": date(2024, 1, 15)},
    {"name": "Manoj Bajpayee", "email": "manoj.bajpayee@company.com", "department": "Operations", "designation": "Warehouse Lead", "date_of_joining": date(2016, 3, 10)},
    {"name": "Pankaj Tripathi", "email": "pankaj.tripathi@company.com", "department": "Operations", "designation": "Regional Operations Manager", "date_of_joining": date(2015, 9, 1)},
    {"name": "Nawazuddin Siddiqui", "email": "nawaz.siddiqui@company.com", "department": "Engineering", "designation": "Principal Infrastructure Engineer", "date_of_joining": date(2016, 5, 20)},
    {"name": "Gajraj Rao", "email": "gajraj.rao@company.com", "department": "Finance", "designation": "Procurement Manager", "date_of_joining": date(2018, 1, 18)},
    {"name": "Neena Gupta", "email": "neena.gupta@company.com", "department": "Human Resources", "designation": "HR VP", "date_of_joining": date(2014, 10, 5)}
]

def seed_database():
    print("--- Connecting to MySQL Database and Seeding ---")
    try:
        # Create inspector to check if tables exist
        inspector = inspect(engine)
        
        # Create table schema if it doesn't exist
        print("Ensuring table schema exists...")
        Base.metadata.create_all(bind=engine)

        db: Session = SessionLocal()
        try:
            # Fetch all existing emails to avoid duplicates
            existing_emails = {email for (email,) in db.query(Employee.email).all()}
            
            inserted_count = 0
            skipped_count = 0
            
            for emp in MOCK_EMPLOYEES:
                if emp["email"] in existing_emails:
                    skipped_count += 1
                    continue
                
                db_employee = Employee(
                    name=emp["name"],
                    email=emp["email"],
                    department=emp["department"],
                    designation=emp["designation"],
                    date_of_joining=emp["date_of_joining"]
                )
                db.add(db_employee)
                inserted_count += 1
                
            db.commit()
            print(f"Successfully processed seed data: inserted {inserted_count} new records, skipped {skipped_count} existing records.")
        except Exception as e:
            db.rollback()
            print(f"Error during insert operations: {e}")
            raise e
        finally:
            db.close()

    except OperationalError as oe:
        print("\n[Database Connection Error]")
        print("Could not connect to the database. Please verify:")
        print("1. Your MySQL server is running locally.")
        print("2. The database 'employee_db' exists. Run: CREATE DATABASE employee_db;")
        print("3. Your credentials in backend/.env or backend/app/config.py are correct.")
        print(f"\nDetails: {oe}")
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    seed_database()
