const express = require('express');
const router = express.Router();
const resultsController = require('../controllers/resultsController');

console.log('🔧 Loading results routes...');

// Debug endpoint
router.get('/debug', (req, res) => {
  res.json({
    message: '✅ Backend działa z zaktualizowanym kodem',
    timestamp: new Date().toISOString(),
    errorsFilePath: require('path').join(__dirname, '../data/errors.json'),
    routes: [
      'GET /api/results',
      'POST /api/results', 
      'GET /api/results/debug',
      'DELETE /api/results/:id'
    ]
  });
});

router.get('/', resultsController.getAll);
router.post('/', resultsController.create);
router.delete('/:id', resultsController.delete);

console.log('✅ Results routes loaded');
module.exports = router;
