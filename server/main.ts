import { Meteor } from 'meteor/meteor';

import './startup/accounts-config.js';
import './imports/publications/users';
import './imports/publications/images';
//import "../both/methods/patients.methods";
import './imports/publications/agreements';
import './imports/publications/questionnaires';


Meteor.startup(() => {

});
