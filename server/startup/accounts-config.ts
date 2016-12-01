//import { AccountsTemplates } from 'meteor/useraccounts:core';
import { Accounts } from 'meteor/accounts-base';
//import { Roles } from 'meteor/alanning:roles';

Accounts.onCreateUser(function(options, user) {
   // Use provided userData in options, or create an empty object
   // user profile
   if (typeof options.profile !== "undefined") {
       user.profile = options.profile || {};
   }
   // patient profile
   if (typeof options.patient !== "undefined") {
       user.patient = options.patient || {};
   }
   // user status
   if (typeof options.status !== "undefined") {
       user.status = options.status || {};
   }
   // invites array
   if (typeof options.invites !== "undefined") {
       user.invites = options.invites || [];
   }
   // user type
   user.type = options.type || "standard";

   // Returns the user object
   return user;
});

////--------remove login attempt limit-----------------//
//Accounts.removeDefaultRateLimit();
//
////-------set roles--------//
//const setUserRolesOnSignUp = (userId, info) => {
//  Roles.addUsersToRoles(userId, ['provider']);
//};
//
////AccountsTemplates.configure({
////  postSignUpHook: setUserRolesOnSignUp,
////});
//
////-------check user--------//
//Accounts.validateLoginAttempt(function (options) {
//    if (options.user && options.allowed) {
//        var isAdmin = Roles.userIsInRole(options.user, ['provider'])
//        if (!isAdmin) {
//            throw new Meteor.Error(403, "Login permission denied!");
//        }
//    }
//    return true;
//});