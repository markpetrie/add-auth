# add-auth
401 lab assignment - Add user auth to an existing REST API data server. The routes for each resource need to be protected, meaning a request has to come from a logged in user that presents an access token.  Must provide unprotected auth routes for sign-in / sign-up and verify for user management. The first two return a JWT token on success. User model must hash passwords and also compare a subsequent password middleware function that "protects" the resource route. 