📚 DigiLib - Digital Library Management System (Admin Module)
This project is the Backend & Admin Dashboard implementation for the DigiLib system, specifically focusing on Option 2: Library Catalog & Administrative Management.

🚀 Key Features (Option 2)
Full CRUD Management: Advanced Book, Category, and Tag management with specialized permissions.

Interactive Dashboard: Visual statistics using Chart.js integrated into the Django Admin interface.

Advanced Filtering: Server-side search and filtering by category, author, and availability.

Automated Seeding: Custom management command to generate bulk test data.

API Documentation: Fully interactive Swagger/OpenAPI UI for backend testing.

🛠 Tech Stack
Framework: Django 6.0.3 & Django REST Framework.

Database: MySQL.

UI/UX: Django Jazzmin (Admin Theme) & AdminLTE.

Cloud Storage: Cloudinary (for book covers and user avatars).

Auth: JWT (JSON Web Token) via SimpleJWT.

🔧 Installation & Setup
Clone the repository:

Bash
git clone <your-repository-url>
cd DigiLib
Install dependencies:

Bash
pip install -r requirements.txt
Configure Database:
Update the DATABASES setting in DigiLib/settings.py with your MySQL credentials.

Apply Migrations:

Bash
python manage.py makemigrations
python manage.py migrate
Generate Mock Data:
Populate the library with 50 books and 100 borrow records:

Bash
python manage.py seed_data
Run the server:

Bash
python manage.py runserver
📖 API Usage
Swagger UI: http://127.0.0.1:8000/swagger/

Admin Dashboard: http://127.0.0.1:8000/admin/

Statistics View: http://127.0.0.1:8000/admin/library-stats/

🛡 Authentication
Administrative actions (Create/Update/Delete) require a Bearer Token with admin or librarian roles.

Obtain token: POST /api/token/

Use token: Add Authorization: Bearer <your_token> to request headers.