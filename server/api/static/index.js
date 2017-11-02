'use strict';

import express from 'express';
import auth from '../../auth/auth.service';
import path from 'path';
import fs from 'fs';

const router = express.Router();

router.get('/avatars/:filename', [auth.isAuthenticated()], function(req, res, next)
{
    if(req.params.filename)
    {
        const userId    = req.user.user_id;
        const file      = req.params.filename;
        const fullPath  = path.join(__dirname, '/../../uploads/users/' + userId + '/' + file);

        if (fs.existsSync(fullPath)) {
            res.sendFile(fullPath);
        }
        else
        {
            res.status(400).send('File not found.');
        }
    }
});

export default router;
