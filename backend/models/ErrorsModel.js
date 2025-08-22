const fs = require('fs').promises;
const path = require('path');

const ERRORS_FILE = path.join(__dirname, '../data/errors.json');

console.log('🔄 Loading ErrorsModel...');
console.log('📁 Errors file path:', ERRORS_FILE);

class ErrorsModel {
  static async ensureFile() {
    try {
      await fs.access(ERRORS_FILE);
      console.log('✅ Errors file exists');
    } catch {
      console.log('📝 Creating new errors file');
      const dir = path.dirname(ERRORS_FILE);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(ERRORS_FILE, '{}', 'utf8');
      console.log('✅ Created errors.json file');
    }
  }

  static async loadErrors() {
    try {
      await this.ensureFile();
      const data = await fs.readFile(ERRORS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      console.log('📖 Loaded errors from file:', Object.keys(parsed).length, 'entries');
      return parsed;
    } catch (error) {
      console.error('❌ Error loading errors:', error);
      return {};
    }
  }

  static async saveErrors(errors) {
    try {
      console.log('💾 Saving errors to file:', Object.keys(errors).length, 'entries');
      console.log('📝 Full errors object being saved:', JSON.stringify(errors, null, 2));
      await fs.writeFile(ERRORS_FILE, JSON.stringify(errors, null, 2), 'utf8');
      console.log('✅ Errors saved successfully to:', ERRORS_FILE);
      
      // Weryfikacja zapisu - natychmiast przeczytaj z powrotem
      const verification = await fs.readFile(ERRORS_FILE, 'utf8');
      console.log('🔍 Verification - file content after save:', verification);
    } catch (error) {
      console.error('❌ Error saving errors:', error);
      throw error;
    }
  }

  static async saveErrorsForResult(resultId, errorsList) {
    console.log(`🔥🔥🔥 saveErrorsForResult WYWOŁANE!`);
    console.log(`   - resultId: ${resultId} (type: ${typeof resultId})`);
    console.log(`   - errorsList:`, errorsList);
    console.log(`   - errorsList stringified:`, JSON.stringify(errorsList));
    console.log(`   - File path: ${ERRORS_FILE}`);
    
    try {
      const allErrors = await this.loadErrors();
      console.log('🔥 Current errors loaded:', allErrors);
      
      const key = resultId.toString();
      allErrors[key] = errorsList || [];
      
      console.log('🔥 About to save:', allErrors);
      await this.saveErrors(allErrors);
      console.log(`🔥 SUCCESS: Errors saved for result ${resultId}`);
      
    } catch (error) {
      console.error(`🔥 FATAL ERROR in saveErrorsForResult:`, error);
      console.error(`🔥 Stack:`, error.stack);
      throw error;
    }
  }

  static async getErrorsForResult(resultId) {
    console.log(`📖 Getting errors for result ${resultId}`);
    const allErrors = await this.loadErrors();
    const key = resultId.toString();
    const errors = allErrors[key] || [];
    console.log(`Found ${errors.length} errors for result ${resultId}:`, errors);
    return errors;
  }

  static async deleteErrorsForResult(resultId) {
    console.log(`🗑️ Deleting errors for result ${resultId}`);
    const allErrors = await this.loadErrors();
    const key = resultId.toString();
    delete allErrors[key];
    await this.saveErrors(allErrors);
    console.log(`✅ Deleted errors for result ${resultId}`);
  }

  static async getAllErrors() {
    return await this.loadErrors();
  }
}

console.log('✅ ErrorsModel loaded');
module.exports = ErrorsModel;