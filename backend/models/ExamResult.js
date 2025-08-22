const { runAsync, getAllAsync, getAsync } = require('../config/database');

console.log('🔄 Loading ExamResult model...');

class ExamResult {
  static async create(data) {
    console.log('🔄 ExamResult.create called');
    console.log('Data received:', {
      nick: data.nick,
      errors: data.errors,
      errorsList: data.errorsList,
      errorsListType: typeof data.errorsList,
      errorsListLength: data.errorsList?.length
    });
    
    const {
      nick, date, attempt, totalPoints, maxPoints, percentage, passed,
      examType, errors, bonusPoints, notes, conductorName, conductorId,
      questionResults
    } = data;

    // Konwertuj tylko questionResults do JSON string
    const questionResultsJson = questionResults ? JSON.stringify(questionResults) : null;

    const query = `
      INSERT INTO exam_results (
        nick, date, attempt, total_points, max_points, percentage, passed,
        exam_type, errors, bonus_points, notes, conductor_name, conductor_id,
        question_results, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;

    console.log('🔄 SQL Parameters:', [
      nick, date, attempt, totalPoints, maxPoints, percentage, passed ? 1 : 0,
      examType, errors, bonusPoints, notes, conductorName, conductorId,
      questionResultsJson
    ]);

    const result = await runAsync(query, [
      nick, date, attempt, totalPoints, maxPoints, percentage, passed ? 1 : 0,
      examType, errors, bonusPoints, notes, conductorName, conductorId,
      questionResultsJson
    ]);

    console.log('✅ Saved with ID:', result.lastID);
    
    // NATYCHMIAST SPRAWDŹ CO ZOSTAŁO ZAPISANE
    const savedRecord = await getAsync('SELECT errors FROM exam_results WHERE id = ?', [result.lastID]);
    console.log('🔍 Verification - what was actually saved:');
    console.log('Saved errors:', savedRecord.errors);
    
    return result.lastID;
  }

  static async findAll() {
    console.log('🔄 ExamResult.findAll called');
    
    const query = `
      SELECT 
        id, nick, date, attempt, total_points as totalPoints, 
        max_points as maxPoints, percentage, passed, exam_type as examType,
        errors, bonus_points as bonusPoints, notes, conductor_name as conductorName,
        conductor_id as conductorId, question_results as questionResults,
        timestamp
      FROM exam_results 
      ORDER BY timestamp DESC
    `;

    const rows = await getAllAsync(query);
    console.log(`🔄 Raw results from DB: ${rows.length} rows`);
    
    // Debug najnowszego rekordu
    if (rows.length > 0) {
      const latest = rows[0];
      console.log('🔍 Latest record debug:');
      console.log('  - ID:', latest.id);
      console.log('  - examType:', latest.examType);
      console.log('  - errors:', latest.errors);
    }
    
    // Przetwórz wyniki
    const processedResults = rows.map(row => {
      const result = {
        ...row,
        passed: Boolean(row.passed),
        questionResults: null
      };
      
      // Bezpieczne parsowanie questionResults
      if (row.questionResults) {
        try {
          result.questionResults = JSON.parse(row.questionResults);
        } catch (error) {
          console.error(`Error parsing questionResults for ID ${row.id}:`, error);
        }
      }

      return result;
    });

    console.log('✅ Returning processed results');
    return processedResults;
  }

  static async findById(id) {
    const query = `
      SELECT 
        id, nick, date, attempt, total_points as totalPoints, 
        max_points as maxPoints, percentage, passed, exam_type as examType,
        errors, bonus_points as bonusPoints, notes, conductor_name as conductorName,
        conductor_id as conductorId, question_results as questionResults,
        timestamp
      FROM exam_results 
      WHERE id = ?
    `;

    const row = await getAsync(query, [id]);
    
    if (!row) return null;

    const result = {
      ...row,
      passed: Boolean(row.passed),
      questionResults: null
    };

    if (row.questionResults) {
      try {
        result.questionResults = JSON.parse(row.questionResults);
      } catch (error) {
        console.error(`Error parsing questionResults for ID ${row.id}:`, error);
      }
    }

    return result;
  }

  static async delete(id) {
    const query = 'DELETE FROM exam_results WHERE id = ?';
    const result = await runAsync(query, [id]);
    return result.changes > 0;
  }
}

console.log('✅ ExamResult model loaded');
module.exports = ExamResult;