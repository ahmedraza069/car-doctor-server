/**
 * -------------------------
 *   MAKE API SECURE
 * ------------------------
 * 
 * CONCEPT : 
 * 1. Assign two tokens for each person (access token, refresh token).
 * 2. Access token contains : user indentificaton (email, role, etc) valid for shorter duration.
 * 3. refresh token is used : to recreate ana ccess tokent hat was expired
 * 4. if refresh token is invalid then logout the user.
 * 
 * **/ 

/**
 * 1. jwt ---> json web token
 * 2. generate a token by using jwt.sign
 * 3. create api set to cookie http only, secure, sameSite
 * 4. from clinet side : axios with credentails true
 * 5. cros setup origin and credentials: true
 * **/

/**
 * 1. for secure api calls
 * 2. server side : install cookie parser and use if as as middleware
 * 3. req.cookies
 * 4. on the client site : make api call using axios withCredentials: true and credentials include while using fetch
 * 
*/