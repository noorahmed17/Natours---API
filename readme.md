# ![ReferenceImage](/public/img/logo-green.png)

An awesome tour booking site built on top of **NodeJS**.

## Overview 🧐

Natours is a modern web application designed for adventurers and tour enthusiasts to explore, book, and manage guided tours with ease. It combines a user-friendly interface with robust features for both users and administrators.

## Key Features 📝

1. Authentication and Authorization

- Sign up, Log in, Logout, Forget and Reset password.
- Role-based access control for regular users, admins, and guides.

2. User Profile Management

- Update username, password, photo , email and personal information.
- Default role assignment as a **regular user** upon registration.

3. Tour Management

- Browse tours with detailed descriptions, photos, maps, and pricing.
- Tours can be created by an admin, guide or lead-guide.
- Tours can be updated by an admin, guide or lead guide.
- Tours can be deleted by an admin, guide or lead-guide.

4. Review Management

- An Admin can delete any review.
- All users can see the reviews of each tour.
- User can only review on his/her booked tours
- User cannot review twice on the same tour
- Regular users can edit and delete their reviews.

5. Booking Management

- Only regular users can book tours and track bookings from their profile.
- User cannot book the same tour twice.
- An admin or lead-guide can see every booking on the app.
- An admin or lead-guide can delete any booking.
- An admin and lead-guide can create new booking manually (without payment).
- An admin and lead-guide can edit any booking.
- System manages tour start dates to ensure only upcoming dates are available for booking

6. Credit card Payment

## Demonstration 🖥

Home Page :

![HomePage](https://raw.githubusercontent.com/noorahmed17/Natours---API/master/public/screenshots/home.gif)

Tour Details :

![TourDetails](https://raw.githubusercontent.com/noorahmed17/Natours---API/master/public/screenshots/tour.gif)

Login Page :

![LogInPage](https://raw.githubusercontent.com/noorahmed17/Natours---API/master/public/screenshots/login.gif)

Signup Page :

![SignUpPage](https://raw.githubusercontent.com/noorahmed17/Natours---API/master/public/screenshots/signup.gif)

Payment Process:

![Payment](https://raw.githubusercontent.com/noorahmed17/Natours---API/master/public/screenshots/payment.gif)

Booked Tours :

![BookedTours](https://raw.githubusercontent.com/noorahmed17/Natours---API/master/public/screenshots/bookedTours.jpg)

User Profile :

<img src="https://raw.githubusercontent.com/noorahmed17/Natours---API/master/public/screenshots/user.png" alt="UserProfile" width="600" height="600">

Admin Profile :

<img src="https://raw.githubusercontent.com/noorahmed17/Natours---API/master/public/screenshots/admin.png" alt="UserProfile" width="600" height="600">

## Build With 🏗

- [NodeJs](https://nodejs.org/en/) - JS runtime environment.
- [Express](https://expressjs.com/) - Web framework for Node.js.
- [MongoDB](https://www.mongodb.com/) - Database service.
- [Pug](https://pugjs.org/) - Template engine for rendering HTML views.
- [Parcel](https://parceljs.org/) - Asset bundler for frontend resources.
- [JWT (JSON Web Token)](https://jwt.io/) - Secure authentication and authorization.
- [Stripe](https://stripe.com/) - Payment gateway for handling transactions.
- [Postman](https://www.postman.com/) - API testing and debugging platform.
- [Mailosaur](https://mailosaur.com/) and [SendGrid](https://sendgrid.com/) - Email services for communication.
- [Mapbox](https://www.mapbox.com/) - Mapping service for tour locations.

## Future Updates 📃

- Project Deployement On Heroku
- Improve User Interface

## Acknowledgement 🙏🏻

This project is part of the online course I've taken at Udemy. Thanks to Jonas Schmedtmann for creating this awesome course! Link to the course: [Node.js, Express, MongoDB & More: The Complete Bootcamp](https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/)
