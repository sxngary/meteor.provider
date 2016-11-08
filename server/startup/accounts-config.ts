import { Accounts } from 'meteor/accounts-base';

Accounts.onCreateUser(function(options, user) {
   // Use provided profile in options, or create an empty object
   //user.profile = options.profile || {};
   
   // Assigns first and last names to the newly created user object
   //user.profile.firstName = options.firstName;
   //user.profile.lastName = options.lastName;
   
   // Use provided userData in options, or create an empty object
   // patient profile
   user.patient = options.patient || {};
   // user status
   user.status = options.status || {};
   // invites array
   user.invites = options.invites || [];
   // user type
   user.type = options.type || "standard";

   // Returns the user object
   return user;
});