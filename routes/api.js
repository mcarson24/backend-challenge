const express   = require('express');
const router    = express();
const snapshots_controller = require('../controllers/snapshotsController');

router.get('/stations', snapshots_controller.index);
router.get('/stations/:id', snapshots_controller.getStationSnapshot)

module.exports = router;
