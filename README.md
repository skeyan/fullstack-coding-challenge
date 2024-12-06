# New York City Council Full Stack Coding Challenge

## Submission

Eva Yan - December 2024

### Process

1. Read through project description and ran through the setup for frontend and backend.
2. Ran server and app locally, resolved CORS and local env issues.
3. Performed initial testing of /admin and /login endpoints using Django API UI to understand how it works.
4. Read up on Django docs and DRF QuickStart guides.
5. Broke down the tasks into different buckets and created stories for each:
   - Login
   - Dashboard setup
   - /allComplaints
   - /openCases and /closedCases
   - /topComplaints
   - Bonus task - User
   - Bonus task - Complaints by constituents
   - Final refactor/clean up/bug fixes/etc.
6. Recorded changes taken for each bucket/stories in a separate Google doc.
7. Went through each bucket sequentially, performing small refactors and adding tests as needed as a sanity check.

### Screenshots

![image](https://github.com/user-attachments/assets/8a84f622-3bd1-4105-9755-9790a7131a7c)
Wrong credentials:
![image](https://github.com/user-attachments/assets/8aefa090-8304-4e85-970d-b3b049695616)

Dashboard:
![image](https://github.com/user-attachments/assets/ddcb4cfd-5537-4ed2-a3e9-6e116f8b8d1c)
Dashboard toggling:
![image](https://github.com/user-attachments/assets/ff572138-ee57-43e0-8a69-c9238b66eba0)
![image](https://github.com/user-attachments/assets/ec847f35-7a80-40b3-8e95-5b474f95d40b)
Mobile example:
![image](https://github.com/user-attachments/assets/088925a2-ee01-43b2-9a1b-ada9c81b1d92)


### Features

- [X] Council member can login with their username and password
- [X] Council member can view a dashboard page with select statistics of total open and closed cases, and top 3 complaints and count
- [X] Council member can view a tabular display of all complaints made within their district by any constituents
- [X] Council member can trigger a button to replace both the tabular display and the select statistics for complaints made by constituents in their district

### Notes

- Tests are all optional, I added them in case they are recommended and also as a personal sanity check.
  - Frontend tests: In the /frontend folder, run `npm run test`
  - Django tests: In the /challenge folder, run `./test.bat`
- For the Bonus task - Complaints by consituents, I ended up modifying some of the existing ViewSets to accept an additional `constituents` parameter. I was conflicted over whether to update the statistics (e.g., num open and closed cases) when the button was toggled. I ended up going with the update and the extra param, so that the council member could hypothetically view these statistics that might be additionally interesting to them. If I were working in a team, I would confirm the desired product behavior first.

### References Used

- https://www.django-rest-framework.org/topics/ajax-csrf-cors/
- https://github.com/testing-library/dom-testing-library/releases/tag/v7.0.0
- https://testing-library.com/docs/react-testing-library/intro
- https://docs.djangoproject.com/en/5.1/ref/models/querysets/#field-lookups
- https://docs.djangoproject.com/en/5.1/ref/models/querysets/#field-lookups
- https://docs.djangoproject.com/en/5.0/topics/db/aggregation/
- https://docs.djangoproject.com/en/5.0/topics/db/queries/
- https://www.django-rest-framework.org/api-guide/fields/#source
- https://www.django-rest-framework.org/api-guide/relations/

### Reflections

It was a new but fun experience learning Django and DRF after working a lot with Ember at my current job.

---

## The Task

You will have **1 full week** to complete this challenge starting when you received the challenge from our office. You can submit your challenge using our [Google Form](https://forms.gle/HXCXFiVvFAJ3WzAc7).

NYC’s 51 Council Members want a dashboard application that shows the complaints being made in their respective district. The backend will be a Django RESTful API and a React frontend that makes API calls to the backend endpoints.

## What we’re providing

We’ve set up some starter code for you to use. For this challenge you will be working with React as your frontend and Django as your backend API. Here’s what we’ve done to get you set up:

- The default React files generated by the `npx create-react-app` command.
- Django files generated by the `django-admin startproject` command.
- A SQLite3 database that’s already seeded with User data, UserProfile data, and Complaint data.
  - Each login follows this format:
    - Username: {first_name_initial}{last_name}
    - Password: {last_name}-{district_number}
    - (NOTE: Single digit district numbers do not have zero-padding)
- Empty methods/views for the endpoints that you will use on the React side.

## Important things to know about the data

1. The fields `account` and `council_dist` both refer to a council district. However, `account` refers to the district in which the complaint is being made, and `council_dist` refers to the district in which the person who is making the complaint lives. _(i.e., John Doe is the Council Member for **District 1**, if a noise complaint labels `account` as `NYCC01` and `council_dist` as `NYCC34`, that means the complaint is being made in his district 1, by a person who lives in district 34)._
2. All of the data are string data types except for the open and close dates. In addition, the data is **NOT** entirely clean; some fields will be empty strings or NULL.
3. Single digit districts numbers are padded by a zero in the Complaint table, **BUT** single digit district numbers in the UserProfile table are **NOT** padded by a zero. You will need to take this into consideration when writing your code.

## How to Start

1. Start by **cloning** this [Github repository](https://github.com/NewYorkCityCouncil/fullstack-coding-challenge) to download the starter code.
2. Make sure your repository is **public** so the team can access and review the code.
3. For the backend environment, make sure you have python (**version 3.10.9 or greater**) and pip (**version 22.3.1 or greater**) installed.
4. For the frontend environment, make sure you have node (**version 14.17.1 or greater**) and npm (**version 9.6.2 or greater**) or a similar yarn version installed
5. Inside the main directory (`fullstack-coding-challenge/challenge`), run the following commands to install your dependencies and set up your database:
   - `pip install -r requirements.txt` (you can do this in a virtual environment like venv or anaconda if you’d like)
   - `python manage.py migrate`
   - `python manage.py populate_db`
   - `python manage.py createsuperuser` (If you want to access the django admin portal to view the data)
6. Inside of the React app (`fullstack-coding-challenge/challenge/frontend`), run `npm install` to get all of your frontend dependencies.
7. From there you should be able to start your frontend and backend using `npm start` and `python manage.py runserver`, respectively.

## The API endpoints

`localhost:8000`

| Route                            | Method | Description                                                                                                                                                                                                                  |
| -------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/admin/`                        | GET    | Log in for superusers into the Django admin portal                                                                                                                                                                           |
| `/login/`                        | POST   | Accepts username and password and returns a **token**. Use this **token** to authorize use of other endpoints. View the [documentation](https://www.django-rest-framework.org/api-guide/authentication/#basicauthentication) |
| `/api/complaints/allComplaints`  | GET    | Returns **all complaints**                                                                                                                                                                                                   |
| `/api/complaints/openCases/`     | GET    | Returns **all open complaints**                                                                                                                                                                                              |
| `/api/complaints/closedCases/`   | GET    | Returns **all closed complaints**                                                                                                                                                                                            |
| `/api/complaints/topComplaints/` | GET    | Returns **top 3 complaint types**                                                                                                                                                                                            |

**NOTE**: All complain endpoints should return complaints that occur in the user's district. View the "[Important things to know about the data](https://github.com/NewYorkCityCouncil/fullstack-coding-challenge#important-things-to-know-about-the-data)" section for more clarification.

## MVP

### The Django Side ([Django Documentation](https://docs.djangoproject.com/en/2.2/))

1. Fill in the empty viewsets with database queries that the frontend is requesting (see React MVP #2) (`fullstack-coding-challenge/challenge/complaint_app/views.py`) ([Django REST framework viewset documentation](https://www.django-rest-framework.org/api-guide/viewsets/))

### The React Side ([React Documentation](https://reactjs.org/docs/getting-started.html))

1. Create a simple login page for Council members to input their credentials (see above in the ‘[What we’re providing](https://github.com/NewYorkCityCouncil/fullstack-coding-challenge#what-were-providing)’ section for the format)
2. Create simple dashboard page that displays the following information:
   - The number of open cases in their district (has an open date, but no closing date)
   - The number of closed cases in their district
   - The top type of complaint being made in their district
   - Tabular data of all complaints made in their district

## BONUS POINTS

### The Django Side

1. Create new endpoint and viewset that should return all complaints that were made by constituents that live in the logged in council member’s district. _(i.e., John Doe is the Council Member for District 1, and he clicks on the new button. His dashboard table now only shows complaints where `conucil_dist` is `NYCC01`)._
2. Update the UserProfile serializer to flatten the User object to reduce calls to the database.

### The React Side

Create a button labelled “Complaints by My Constituents”. This button will trigger a GET request to a different endpoint than what you’ve been using for the MVP. The data return from this endpoint should replace the data in the table.
