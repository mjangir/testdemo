import multer from 'multer';
import path from 'path';
import uuid from 'uuid';
import _ from 'lodash';

export const checkNestedPropery = function(obj)
{
  var args = Array.prototype.slice.call(arguments, 1);

  for(let i = 0; i < args.length; i++)
  {
    if(!obj || !obj.hasOwnProperty(args[i]))
    {
      return false;
    }
    obj = obj[args[i]];
  }
  return true;
}

export const userAvatarMulter = function()
{
    const storage = multer.diskStorage({
      destination: function (req, file, cb)
      {
          cb(null, path.join(__dirname, '../../client/uploads/'));
      },
      filename: function (req, file, cb)
      {
          cb(null, uuid.v4() + path.extname(file.originalname));
      }
    });

    return multer({
        storage: storage
    });
}

export const signupUserPhotoUpload = function()
{
    const storage = multer.diskStorage({
      destination: function (req, file, cb)
      {
          cb(null, path.join(__dirname, '../uploads/profile_pics'));
      },
      filename: function (req, file, cb)
      {
          cb(null, uuid.v4() + path.extname(file.originalname));
      }
    });

    return multer({
        storage: storage
    });
}

export const generateRandomString = function(length, chars)
{
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
    return result;
}

export const convertAmountToCommaString = function(amt)
{
  return Number(amt).toLocaleString();
}

export const findClientsSocket = function(roomId, namespace)
{
    var response = [], ns = namespace;

    if (namespace)
    {
        for (var id in namespace.connected)
        {
            if(roomId)
            {
                var index = namespace.connected[id].rooms.indexOf(roomId);
                
                if(index !== -1)
                {
                    response.push(namespace.connected[id]);
                }
            }
            else
            {
                response.push(namespace.connected[id]);
            }
        }
    }
    return response;
}

export const getUserObjectById = function(userId)
{
  if(typeof global.ticktockGameState != 'undefined' && global.ticktockGameState.users && global.ticktockGameState.users.length > 0)
  {
    return _.find(global.ticktockGameState.users, {id: parseInt(userId, 10)});
  }

  return false;
}