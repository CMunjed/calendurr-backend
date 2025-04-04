# calendurr-backend

## TODO
* Refresh tokens
* Use cookies for more secure JWT storage
* Core backend functionality (schedule creation)

## Front-end --> Back-end flow
Login \
↓ \
POST /auth/login → set access + refresh tokens \
↓ \
User makes API requests with access token \
↓ \
If 401 (token expired), auto-call /auth/refresh (sends refresh cookie) \
↓ \
Server sends new access token \
↓ \
Frontend retries original request