const ExamResult = require('../models/ExamResult');
const ErrorsModel = require('../models/ErrorsModel');

console.log('🔄 Loading resultsController...');

const resultsController = {
  // Stwórz nowy wynik
  async create(req, res) {
    try {
      console.log('=== CONTROLLER CREATE DEBUG ===');
      console.log('Full request body:', JSON.stringify(req.body, null, 2));
      
      const {
        nick, date, attempt, totalPoints, maxPoints, percentage, passed,
        examType, errors, bonusPoints, notes, conductorName, conductorId,
        questionResults, errorsList
      } = req.body;

      // Walidacja podstawowych danych
      if (!nick || !examType) {
        return res.status(400).json({ 
          error: 'Nick i typ egzaminu są wymagane' 
        });
      }

      console.log('=== ERRORS DEBUG NAJWAŻNIEJSZY ===');
      console.log('errorsList received from frontend:', errorsList);
      console.log('errorsList stringified:', JSON.stringify(errorsList));
      console.log('errorsList type:', typeof errorsList);
      console.log('errorsList is Array:', Array.isArray(errorsList));
      console.log('errorsList length:', errorsList?.length);

      // Zapisz wynik do bazy danych (bez errorsList)
      const resultId = await ExamResult.create({
        nick, date, attempt, totalPoints, maxPoints, percentage, passed,
        examType, errors, bonusPoints, notes, conductorName, conductorId,
        questionResults
      });

      console.log('✅ Result saved to database with ID:', resultId);

      // WYMUŚ ZAPIS BŁĘDÓW - NIEZALEŻNIE OD WARUNKÓW
      console.log('🔥 FORCING ERROR SAVE TO JSON...');
      console.log('🔥 About to call ErrorsModel.saveErrorsForResult with:');
      console.log('   - resultId:', resultId);
      console.log('   - errorsList:', errorsList);
      
      try {
        // WYMUŚ IMPORT JESZCZE RAZ
        const ErrorsModel = require('../models/ErrorsModel');
        console.log('🔥 ErrorsModel imported successfully');
        
        // WYMUŚ ZAPIS
        await ErrorsModel.saveErrorsForResult(resultId, errorsList || []);
        console.log('🔥 ErrorsModel.saveErrorsForResult completed!');
        
      } catch (errorSaveError) {
        console.error('🔥 ERROR DURING ERROR SAVE:', errorSaveError);
        console.error('🔥 Stack:', errorSaveError.stack);
      }

      // Pobierz utworzony wynik z błędami
      const createdResult = await ExamResult.findById(resultId);
      const errorsData = await ErrorsModel.getErrorsForResult(resultId);
      
      // Dodaj errorsList do odpowiedzi
      createdResult.errorsList = errorsData;

      console.log('=== FINAL RESPONSE DEBUG ===');
      console.log('Response errorsList:', createdResult.errorsList);

      res.status(201).json(createdResult);
    } catch (error) {
      console.error('❌ Error creating result:', error);
      res.status(500).json({ 
        error: 'Błąd podczas zapisywania wyniku',
        details: error.message 
      });
    }
  },

  // Pobierz wszystkie wyniki
  async getAll(req, res) {
    try {
      console.log('=== CONTROLLER GETALL DEBUG ===');
      const results = await ExamResult.findAll();
      
      console.log('Fetched results count:', results.length);

      // Dodaj errorsList do każdego wyniku
      const resultsWithErrors = await Promise.all(
        results.map(async (result) => {
          const errorsData = await ErrorsModel.getErrorsForResult(result.id);
          return {
            ...result,
            errorsList: errorsData
          };
        })
      );

      const sprawdzanieResults = resultsWithErrors.filter(r => r.examType === 'sprawdzanie');
      if (sprawdzanieResults.length > 0) {
        console.log('=== FIRST SPRAWDZANIE RESULT ===');
        console.log('ID:', sprawdzanieResults[0].id);
        console.log('errors:', sprawdzanieResults[0].errors);
        console.log('errorsList:', sprawdzanieResults[0].errorsList);
        console.log('errorsList type:', typeof sprawdzanieResults[0].errorsList);
        console.log('errorsList is array:', Array.isArray(sprawdzanieResults[0].errorsList));
        
        if (sprawdzanieResults[0].errorsList) {
          console.log('errorsList content:', JSON.stringify(sprawdzanieResults[0].errorsList));
        }
      }

      res.json(resultsWithErrors);
    } catch (error) {
      console.error('Error fetching results:', error);
      res.status(500).json({ 
        error: 'Błąd podczas pobierania wyników',
        details: error.message 
      });
    }
  },

  // Pobierz wyniki według typu
  async getByType(req, res) {
    try {
      const { type } = req.params;
      const results = await ExamResult.findAll();
      const filteredResults = results.filter(result => result.examType === type);
      
      // Dodaj errorsList do każdego wyniku
      const resultsWithErrors = await Promise.all(
        filteredResults.map(async (result) => {
          const errorsData = await ErrorsModel.getErrorsForResult(result.id);
          return {
            ...result,
            errorsList: errorsData
          };
        })
      );

      res.json(resultsWithErrors);
    } catch (error) {
      console.error('Error fetching results by type:', error);
      res.status(500).json({ 
        error: 'Błąd podczas pobierania wyników według typu',
        details: error.message 
      });
    }
  },

  // Usuń wynik
  async delete(req, res) {
    try {
      const { id } = req.params;
      const resultId = parseInt(id);
      
      // Usuń z bazy danych
      const deleted = await ExamResult.delete(resultId);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Wynik nie został znaleziony' });
      }

      // Usuń błędy z JSON
      await ErrorsModel.deleteErrorsForResult(resultId);

      res.json({ message: 'Wynik został usunięty' });
    } catch (error) {
      console.error('Error deleting result:', error);
      res.status(500).json({ 
        error: 'Błąd podczas usuwania wyniku',
        details: error.message 
      });
    }
  }
};

console.log('✅ resultsController loaded');
module.exports = resultsController;
