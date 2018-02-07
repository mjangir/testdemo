import sqldb from '../sqldb';
import {generateRandomString} from '../utils/functions';

const User            = sqldb.User;
const Jackpot         = sqldb.Jackpot;
const Role            = sqldb.Role;
const UserGroup       = sqldb.UserGroup;
const LinkCategory    = sqldb.LinkCategory;
const Link            = sqldb.Link;
const LinkPermission  = sqldb.LinkPermission;
const Settings        = sqldb.Settings;

// Create Guest Role Group and Users
function createGuestRoleGroupUsers()
{
  return Role.create(
  {
    role: 'Guest',
    UserGroups: [
      {
        groupName   : 'Default Guest Group',
        alias       : 'default_guest_group',
        description : 'All guest users here',
        Users       : [
          {
            name: 'Manish Jangir',
            email: 'manish@ticktock.com',
            password: 'password'
          },
          {
            name: 'Viral Solani',
            email: 'viral@ticktock.com',
            password: 'password'
          },
          {
            name: 'Neeraj Jani',
            email: 'neeraj@ticktock.com',
            password: 'password'
          },
          {
            name: 'Kevin',
            email: 'kevin@ticktock.com',
            password: 'password'
          },
          {
            name: 'Anuj',
            email: 'anuj@ticktock.com',
            password: 'password'
          },
          {
            name: 'Saransh',
            email: 'saransh@ticktock.com',
            password: 'password'
          }
        ]
      }
    ]
  },
  {
    include: [
    {
        model   : UserGroup,
        as      : 'UserGroups',
        include : [
        {
            model   : User,
            as      : 'Users'
        }]
    }]
  });
}

// Create Admin Role Groups and Users
function createAdminRoleGroupUsers()
{
  return Role.create(
  {
    role: 'Admin',
    UserGroups: [
      {
        groupName   : 'Default Admin Group',
        alias       : 'default_admin_group',
        description : 'All admin users here',
        Users       : [
          {
            name: 'Ticktock Admin',
            email: 'admin@admin.com',
            password: 'password',
          }
        ]
      }
    ]
  },
  {
    include: [
    {
        model   : UserGroup,
        as      : 'UserGroups',
        include : [
        {
            model   : User,
            as      : 'Users'
        }]
    }]
  }).then(function()
  {
    // Create Guest Users

  });
}

// Create Backend Link Categories, Links And Permissions
function createBackendLinkCategoriesLinksAndPermissions()
{
  return LinkCategory.create(
  {
    name    : 'Backend Sidebar Links',
    alias   : 'backend_sidebar_links',
    roleId  : 1,
    Links   : [
    {
      parentId        : 0,
      linkOrder       : 1,
      name            : 'Dashboard',
      alias           : 'admin_dashboard',
      icon            : 'fa fa-dashboard',
      href            : 'admin/dashboard',
      actions         : '{"ALL":"All Rights"}',
      LinkPermissions : [{
        groupId   : 1,
        permissions: '["ALL"]'
      }]
    },
    {
      parentId        : 0,
      linkOrder       : 2,
      name            : 'Manage Settings',
      alias           : 'admin_setting',
      icon            : 'fa fa-gear',
      href            : 'admin/setting',
      actions         : '{"ALL":"All Rights"}',
      LinkPermissions : [{
        groupId   : 1,
        permissions: '["ALL"]'
      }]
    },
    {
      parentId        : 0,
      linkOrder       : 3,
      name            : 'Manage User Groups',
      alias           : 'admin_user_groups',
      icon            : 'fa fa-group',
      href            : 'admin/user-groups',
      actions         : '{"LISTING":"View User Groups List","ADD":"Add User Group","UPDATE":"Update User Group","DELETE":"Delete User Group","VIEW":"View User Group","UPDATE_PERMISSIONS":"Update User Group Permissions"}',
      LinkPermissions : [{
        groupId   : 1,
        permissions: '["LISTING", "ADD", "UPDATE", "DELETE", "VIEW", "UPDATE_PERMISSIONS"]'
      }]
    },
    {
      parentId        : 0,
      linkOrder       : 4,
      name            : 'Manage Users',
      alias           : 'admin_users',
      icon            : 'fa fa-user',
      href            : 'admin/users',
      actions         : '{"LISTING":"View Users List","ADD":"Add User","UPDATE":"Update User","DELETE":"Delete User","VIEW":"View User Info","STATUS":"Block\/Unblock User"}',
      LinkPermissions : [{
        groupId   : 1,
        permissions: '["LISTING", "ADD", "UPDATE", "DELETE", "VIEW", "STATUS"]'
      }]
    },
    {
      parentId        : 0,
      linkOrder       : 5,
      name            : 'Manage Jackpots',
      alias           : 'admin_jackpots',
      icon            : 'fa fa-tag',
      href            : 'admin/jackpots',
      actions         : '{"LISTING":"View Jackpots List","ADD":"Add Jackpot","UPDATE":"Update Jackpot","DELETE":"Delete Jackpot","VIEW":"View Jackpot Info","STATUS":"Block/Unblock Jackpot", "VIEW_GAME_HISTORY":"View Game History", "VIEW_JACKPOT_GAME_USERS":"View Jackpot Game Users", "NORMAL_BID_BATTLE":"View Normal Bid Battle", "GAMBLING_BID_BATTLE":"View Gambling Bid Battle"}',
      LinkPermissions : [{
        groupId   : 1,
        permissions: '["LISTING", "ADD", "UPDATE", "DELETE", "VIEW", "STATUS", "VIEW_GAME_HISTORY", "VIEW_JACKPOT_GAME_USERS", "NORMAL_BID_BATTLE", "GAMBLING_BID_BATTLE"]'
      }]
    },
    {
      parentId        : 0,
      linkOrder       : 6,
      name            : 'Manage Links',
      alias           : 'admin_manage_system_links',
      icon            : 'fa fa-tag',
      href            : 'admin/links',
      actions         : '{"LISTING":"View Links List","ADD":"Add New Link","UPDATE":"Update Link","DELETE":"Delete Link","VIEW":"View Link","STATUS":"Block/Unblock Link"}',
      LinkPermissions : [{
        groupId   : 1,
        permissions: '["LISTING", "ADD", "UPDATE", "DELETE", "VIEW", "STATUS"]'
      }]
    }
    ]
  },
  {
    include: [
    {
        model   : Link,
        as      : 'Links',
        include : [
        {
            model   : LinkPermission,
            as      : 'LinkPermissions'
        }]
    }]
  });
}

// Create Frontend Link Categories, Links And Permissions
function createFrontendLinkCategoriesLinksAndPermissions()
{
  return LinkCategory.create(
  {
    name    : 'Frontend Main Navigation Links',
    alias   : 'frontend_main_navigation_links',
    roleId  : 2,
    Links   : [
    {
      parentId        : 0,
      linkOrder       : 1,
      name            : 'Home',
      alias           : 'frontend_home',
      icon            : '',
      href            : '/',
      actions         : '{"ALL":"All Rights"}',
      LinkPermissions : [{
        groupId   : 2,
        permissions: '["ALL"]'
      }]
    }
    ]
  },
  {
    include: [
    {
        model   : Link,
        as      : 'Links',
        include : [
        {
            model   : LinkPermission,
            as      : 'LinkPermissions'
        }]
    }]
  });
}

// Insert Settings
function createDefaultSettings()
{
  Settings.bulkCreate([
  {
    key   : 'enable_signup_email_confirmation',
    value : 1
  },
  {
    key   : 'send_signup_success_email',
    value : 1
  },
  {
    key   : 'signup_confirm_message',
    value : 'Thanks! A confirmation email has been sent to your email ID. Follow that link to complete your registration.'
  },
  {
    key   : 'signup_success_message',
    value : 'Congratulations! You have successfully registered on TickTock'
  },
  ,{
    key   : 'signup_failed_message',
    value : 'Oops! Sign Up got failed due to some errors. Please try later.'
  },
  {
    key   : 'send_password_reset_link_success_message',
    value : 'A password reset link has been sent to your email ID. Follow that link to reset your password.'
  },
  {
    key   : 'invalid_login_message',
    value : 'Invalid email or password!'
  },
  {
    key   : 'send_password_reset_link_failed_message',
    value : 'Sorry! but the password reset link could be sent due to some internal system error.'
  },
  {
    key   : 'confirm_email_failed_message',
    value : 'Sorry but the link you are trying to complete your registration is expired or malformed.'
  },
  {
    key   : 'password_reset_success_message',
    value : 'You have successfully reset your password.'
  },
  {
    key   : 'password_reset_failed_message',
    value : 'Password could not be reset due to some internal system error.'
  },
  {
    key   : 'application_name',
    value : 'TickTock'
  },
  {
    key   : 'homepage_meta_title',
    value : 'TickTock Home'
  },
  {
    key   : 'homepage_meta_description',
    value : 'TickTock description'
  },
  {
    key   : 'homepage_meta_keywords',
    value : 'ticktock'
  },
  {
    key   : 'contact_person',
    value : 'TickTock Contact Person'
  },
  {
    key   : 'contact_email',
    value : 'TickTock Contact Email'
  },
  {
    key   : 'contact_number',
    value : 'TickTock Contact No.'
  },
  {
    key   : 'fax_number',
    value : 'TickTock FAX No.'
  },
  {
    key   : 'contact_address',
    value : 'TickTock Contact Address'
  },
  {
    key   : 'application_website',
    value : 'www.ticktock.com'
  },
  {
    key   : 'facebook_login_enabled',
    value : 1
  },
  {
    key   : 'google_login_enabled',
    value : 1
  },
  {
    key   : 'twitter_login_enabled',
    value : 0
  },
  {
    key   : 'linkedin_login_enabled',
    value : 0
  },

  {
    key   : 'admin_copyright_text',
    value : 'Copyright &copy; TickTock 2017'
  },

  {
    key   : 'frontend_copyright_text',
    value : 'Copyright &copy; TickTock 2017'
  },

  {
    key   : 'enable_contact_us_auto_reply',
    value : 1
  },

  {
    key   : 'jackpot_setting_game_clock_seconds_increment_on_bid',
    value : 10
  },

  {
    key   : 'jackpot_setting_default_bid_per_user_per_game',
    value : 15
  },

  {
    key   : 'jackpot_setting_last_bid_percent_amount',
    value : 50
  },

  {
    key   : 'jackpot_setting_longest_bid_percent_amount',
    value : 50
  },
  {
    key   : 'normal_battle_levels_json',
    value : '[{"battle_type":"NORMAL","level_name":"Normal Level 1","duration":"300","prize_type":"BID","prize_value":"10","default_bids":"10","last_bid_winner_percent":"50","longest_bid_winner_percent":"50", "increment_seconds":"5","min_players_to_start":"5","min_wins_to_unlock_next":"5"},{"battle_type":"NORMAL","level_name":"Normal Level 2","duration":"300","prize_type":"BID","prize_value":"10","default_bids":"10","last_bid_winner_percent":"50","longest_bid_winner_percent":"50", "increment_seconds":"5","min_players_to_start":"5","min_wins_to_unlock_next":"3"}]'
  },
  {
    key   : 'advance_battle_levels_json',
    value : '[{"battle_type":"ADVANCE","level_name":"Advance Level 1","duration":"300", "min_bids_to_gamb": 10, "default_bids": 10, "last_bid_winner_percent": 50, "longest_bid_winner_percent": 50, "increment_seconds": 10, "min_players_to_start": 3, "min_wins_to_unlock_next": 0, "prize_type": "BID"}, {"battle_type":"ADVANCE","level_name":"Advance Level 2","duration":"300", "min_bids_to_gamb": 10, "default_bids": 10, "last_bid_winner_percent": 50, "longest_bid_winner_percent": 50, "increment_seconds": 10, "min_players_to_start": 3, "min_wins_to_unlock_next": 0, "prize_type": "BID"}]'
  },
  {
    key : 'privacy_text',
    value : 'No text yet'
  },
  {
    key : 'terms_conditions',
    value : 'No terms and conditions provided yet'
  },
  {
    key : 'faq_text',
    value : 'No FAQ Yet'
  }
  ]);
}

export default function()
{
    sqldb.sequelize.sync({force: true}).then(function()
    {

      createAdminRoleGroupUsers()
      .then(function()
      {
        return createBackendLinkCategoriesLinksAndPermissions();
      })
      .then(function(){
        return createGuestRoleGroupUsers();
      })
      .then(function()
      {
        return createFrontendLinkCategoriesLinksAndPermissions();
      });

      // Create Default Settings
      createDefaultSettings();



      // Create Jackpots
      // Jackpot.bulkCreate([{
      //   title: 'First Jackpot',
      //   amount: 50000,
      //   gameClockTime: 600,
      //   doomsDayTime: 259200,
      //   gameClockRemaining: 600,
      //   doomsDayRemaining: 259200,
      //   uniqueId: generateRandomString(20, 'aA'),
      //   gameStatus: 'NOT_STARTED',
      //   createdBy: null,
      //   minPlayersRequired: 3
      // },
      // {
      //   title: 'Second Jackpot',
      //   amount: 30000,
      //   gameClockTime: 120,
      //   doomsDayTime: 1200,
      //   gameClockRemaining: 120,
      //   doomsDayRemaining: 1200,
      //   uniqueId: generateRandomString(20, 'aA'),
      //   gameStatus: 'NOT_STARTED',
      //   createdBy: null,
      //   minPlayersRequired: 4
      // }
      // ]).then(function(){
      //     console.log("######### JACKPOTS CREATED ######");
      // });
    });
}
